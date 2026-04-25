from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re
from loadData import DATASETS
from readFiles import readPDF, readDOCX
import httpx

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


@app.post("/analyze")
async def analyze_career(
    description: str = Form(...),
    timestamp: str = Form(...),
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

    profile = UserProfile(description=full_description, timestamp=timestamp)

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

    client = OpenAI(
        api_key=os.getenv("ZAI_API_KEY"),
        base_url="https://api.ilmu.ai/v1",
        http_client=httpx.Client(timeout=120.0)
    )

    content = f"""
    You are a Decision Intelligence System. Always respond with valid JSON only.

    You have access to these market datasets. You MUST reference the provided datasets as you analyze the profile.
    - MyCOL 2024/25 workforce criticality and role safety data: {workforce_summary}
    - DOSM 2024 median salary and regional wage data: {market_summary}
    - FSF 2025 future skills and skill-up recommendation data: {skills_summary}
    - In-demand jobs: {demand_summary}
    - Career paths: {careers_summary}
    - Graduate statistics: {graduatestats}
    - Course information: {courseinfo_summary}
    - Job information: {job_summary}

    Given this person's profile: {profile.description}

    Give concise recommendations and justify them with the data.
    Use the provided datasets to support:
    - the criticality and safety of the recommended role,
    - the median salary and regional economic signal,
    - a concrete skill-up recommendation,
    - the impact of those skills on career risk, salary, and growth.

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
                "decision_impact": "Explain how adding these skills impacts their career, salary, or risk."
            }}
        ]
    }}

    You can include more or fewer careers depending on what fits this person.
    """

    response = client.chat.completions.create(
        model="ilmu-glm-5.1",
        messages=[
            {"role": "system", "content": "You are a Decision Intelligence System. Always respond with valid JSON only."},
            {"role": "user", "content": content},
        ],
    )

    try:
        raw = response.choices[0].message.content.strip()
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
