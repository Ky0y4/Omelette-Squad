from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import json
import re
from loadData import DATASETS
from readFiles import readPDF, readDOCX

load_dotenv()

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
    budget_constraint: str
    risk_tolerance: str

@app.post("/analyze")
async def analyze_career(
    description: str = Form(...),
    timestamp: str = Form(...),
    budget_constraint: str = Form(...),
    risk_tolerance: str = Form(...),
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

    market_summary     = json.dumps(DATASETS.get('marketanalysis.json', {}))[:2000]
    careers_summary    = json.dumps(DATASETS.get('careers.json', {}))[:2000]
    skills_summary     = json.dumps(DATASETS.get('skillmapping.json', {}))[:1500]
    demand_summary     = json.dumps(DATASETS.get('ondemandjobs.json', {}))[:1500]
    workforce_summary  = json.dumps(DATASETS.get('workforce.json', {}))[:1000]
    graduatestats      = json.dumps(DATASETS.get('graduatestats.json', {}))[:1000]
    courseinfo_summary = json.dumps(DATASETS.get('courseinfo.csv', []))[:1000]
    job_summary        = json.dumps(DATASETS.get('job.csv', []))[:1000]

    prompt = f"""
    Use Decision Intelligence System reasoning. Always respond with valid JSON only.

    You have access to these market datasets. You MUST reference the provided datasets as you analyze the profile.
    - MyCOL 2024/25 workforce criticality and role safety data: {workforce_summary}
    - DOSM 2024 median salary and regional wage data: {market_summary}
    - FSF 2025 future skills and skill-up recommendation data: {skills_summary}
    - In-demand jobs: {demand_summary}
    - Career paths: {careers_summary}
    - Graduate statistics: {graduatestats}
    - Course information: {courseinfo_summary}
    - Job information: {job_summary}

    The user has these constraints:
    - budget_constraint: {profile.budget_constraint}
    - risk_tolerance: {profile.risk_tolerance}

    Given this person's profile: {profile.description}

    You must perform a Weighted Multi-Criteria Decision Analysis (MCDA) in your reasoning.
    Extract and calculate the following values for every recommended career from workforce.json, courseinfo.csv, and marketanalysis.json:
    - annual_salary = starting_salary * 1.25
    - 5_year_earnings = annual_salary * 5 * (1 + salary_growth_rate)
    - ROE = (5_year_earnings - education_cost) / education_cost
    - break_even_years = education_cost / annual_salary
    - financial_score = (ROE * 0.30) + (salary_growth_rate * 0.20) + (employment_probability * 0.20) + ((1 - automation_risk) * 0.15) + ((1 / break_even_years) * 0.15)
    - final_score = (financial_score * 0.6) + (personal_fit_score * 0.4)

    Return final_score as a percentage between 0 and 100.
    Return roe_percentage as a percent value for ROE.

    Apply penalty and tagging rules exactly:
    - If budget_constraint == "low", subtract (education_cost / max_cost) * 0.2 from final_score, where max_cost is the highest fee in courseinfo.csv.
    - If break_even_years > 5, subtract 0.15 from final_score.
    - Add "High Return Career" tag if ROE > 3.
    - Add "Fast Payback" tag if break_even_years < 2.
    - Add warning "High financial risk" if calculated risk > 0.6.
    - Add warning "Potential debt trap" if education_cost > 50000 and annual_salary is low.

    Use the user's risk tolerance and budget constraint to adjust decisions with economic empowerment logic.
    In the "Why it fits" explanation, explicitly explain how the Economic Optimization logic weighs financial constraints, market ROI, and underemployment risk.
    Do not refer to the model or mention any AI system in the output.

    Respond ONLY with a valid JSON object — no markdown, no explanation, no code fences.
    Follow this exact structure:

    {{
        "summary": "...",
        "top_careers": [
            {{
                "role": "...",
                "match_score": 90,
                "why_it_fits": "...",
                "trade_offs": "...",
                "next_steps": "...",
                "market_reality": "Detail the role criticality and safety based on the MyCOL/workforce data.",
                "economic_forecast": "Provide the median salary and regional data based on the DOSM/wage data.",
                "optimization_strategy": "Provide a skill-up recommendation based on the FSF/future skills data.",
                "decision_impact": "Explain how adding these skills impacts their career, salary, or risk.",
                "final_score": 0,
                "roe_percentage": 0,
                "break_even_years": 0,
                "financial_tags": ["..."],
                "risk_warnings": ["..."]
            }}
        ]
    }}

    You can include more or fewer careers depending on what fits this person.
    """

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
    )

    messages = [
        ("system", "You are a Decision Intelligence System. Always respond with valid JSON only."),
        ("human", prompt),
    ]

    response = llm.invoke(messages)

    response = llm.invoke(messages)

    try:
        raw = response.content.strip()
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
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

