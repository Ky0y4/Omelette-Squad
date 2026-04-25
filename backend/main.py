from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json
import re
from loadData import DATASETS
from readFiles import readPDF, readDOCX

load_dotenv()

# Configure the Gemini API client globally
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    description: str
    timestamp: str
    budget_constraint: str = "medium"
    risk_tolerance: str = "low"

@app.post("/analyze")
async def analyze_career(
    description: str = Form(...),
    timestamp: str = Form(...),
    budget_constraint: str = Form("medium"),
    risk_tolerance: str = Form("low"),
    file: UploadFile = File(None),
):
    print(f"I RECEIVED DA DATA: {description[:100]}")

    extra = ""
    if file and file.filename:
        file_bytes = await file.read()
        filename = file.filename.lower()
        try:
            if filename.endswith(".pdf"):
                extra = readPDF(file_bytes)
                print(f"PDF extracted: {len(extra)} chars")
            elif filename.endswith(".docx"):
                extra = readDOCX(file_bytes)
                print(f"DOCX extracted: {len(extra)} chars")
            else:
                raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read file: {e}")

    full_description = description
    if extra:
        full_description += f"\n\n=== ADDITIONAL CONTEXT FROM UPLOADED DOCUMENT ===\n{extra[:3000]}"

    profile = UserProfile(
        description=full_description,
        timestamp=timestamp,
        budget_constraint=budget_constraint,
        risk_tolerance=risk_tolerance,
    )

    try:
        result = await get_response(profile)
        return result
    except Exception as e:
        import traceback
        print(f"FULL ERROR: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

async def get_response(profile: UserProfile) -> dict:
    print("GENERATING RESPONSE TIME")

    market_summary     = json.dumps(DATASETS.get('marketanalysis.json', {}))[:2500]
    careers_summary    = json.dumps(DATASETS.get('careers.json', {}))[:2500]
    skills_summary     = json.dumps(DATASETS.get('skillmapping.json', {}))[:2000]
    demand_summary     = json.dumps(DATASETS.get('ondemandjobs.json', {}))[:2000]
    workforce_summary  = json.dumps(DATASETS.get('workforce.json', {}))[:2000]
    graduatestats      = json.dumps(DATASETS.get('graduatestats.json', {}))[:1500]
    courseinfo_summary = json.dumps(DATASETS.get('courseinfo.csv', []))[:2500]
    job_summary        = json.dumps(DATASETS.get('job.csv', []))[:1500]

    course_records = DATASETS.get('courseinfo.csv', [])
    max_cost = 0
    for row in course_records:
        fee = row.get('Local Fee per Year (MYR)') if isinstance(row, dict) else None
        try:
            if fee is not None and fee != "":
                cost = float(fee)
                max_cost = max(max_cost, cost)
        except Exception:
            continue

    content = f"""
    You are a context-aware Mathematical Decision Intelligence System.
    Always respond with valid JSON only. Do not include markdown, code fences, or any explanation outside the JSON.

    You have access to the following datasets:
    - Workforce intelligence model: {workforce_summary}
    - Market analysis and salary trends: {market_summary}
    - Course information and fees: {courseinfo_summary}
    - Graduate statistics: {graduatestats}
    - Future skills mapping: {skills_summary}
    - In-demand job signals: {demand_summary}
    - Career path descriptions: {careers_summary}
    - Job meta information: {job_summary}

    For every recommended career, calculate these values using dataset information. Use median entry salary from workforce data as starting_salary, employment_rate_6_months as employment_probability, and any automation or role safety indicator available from the workforce model.
    - Annual Salary = starting_salary * 125
    - 5-Year Earnings = annual_salary * 5 * (1 + salary_growth_rate)
    - ROE = (5_year_earnings - education_cost) / education_cost
    - Break-Even Years = education_cost / annual_salary
    - Financial Score = (ROE * 0.30) + (salary_growth_rate * 0.20) + (employment_probability * 0.20) + ((1 - automation_risk) * 0.15) + ((1 / break_even_years) * 0.15)
    - Final Score = (Financial Score * 0.6) + (Personal Fit Score * 0.4)

    Apply these policy rules:
    - If budget_constraint == "low", subtract (education_cost / {max_cost if max_cost > 0 else 1}) * 0.2 from Final Score.
    - If break_even_years > 5, subtract 0.15 from Final Score.
    - Add tag "High Return Career" when ROE > 3.
    - Add tag "Fast Payback" when break_even_years < 2.
    - Add warning "High financial risk" when calculated risk > 0.6.
    - Add warning "Potential debt trap" when education_cost > 50000 and starting_salary is low.

    Weight this recommendation for Economic Empowerment. In the "why_it_fits" section, explain how the career reduces the risk of skill-related underemployment and balances the user's financial constraints with market ROI.
    Mention that this system is performing context-aware reasoning by weighing the user's budget, risk tolerance, and market ROI.

    User profile:
    {profile.description}
    Budget constraint: {profile.budget_constraint}
    Risk tolerance: {profile.risk_tolerance}

    Return JSON in this exact structure only:
    {{
      "summary": "...",
      "top_careers": [
        {{
          "role": "...",
          "match_score": 0,
          "final_score": 0,
          "roe_percentage": 0,
          "break_even_years": 0,
          "financial_tags": ["..."],
          "risk_warnings": ["..."],
          "why_it_fits": "...",
          "trade_offs": "...",
          "next_steps": "...",
          "market_reality": "...",
          "economic_forecast": "...",
          "optimization_strategy": "...",
          "decision_impact": "..."
        }}
      ]
    }}
    """

    try:
        model = genai.GenerativeModel(
            model_name="gemini-3-flash-preview",
            system_instruction="You are a Decision Intelligence System. Always respond with valid JSON only.",
            generation_config={"response_mime_type": "application/json"}
        )

        response = await model.generate_content_async(content)
        raw = response.text.strip()
        print(f"RAW RESPONSE: {raw[:500]}")
        
        return json.loads(raw)
        
    except json.JSONDecodeError as e:
        print(f"JSON PARSE FAILED: {e}")
        print(f"RAW WAS: {raw}")
        raise
    except Exception as e:
        import traceback
        print(f"GET_RESPONSE ERROR: {e}")
        print(traceback.format_exc())
        raise