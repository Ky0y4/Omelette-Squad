from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re
from loadData import DATASETS

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
async def analyze_career(profile: UserProfile):
    print(f"I RECEIVED DA DATA: {profile.description[:100]}")
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

    market_summary = json.dumps(DATASETS.get('marketanalysis.json', {}), indent=None)
    careers_summary = json.dumps(DATASETS.get('careers.json', {}), indent=None)
    skills_summary = json.dumps(DATASETS.get('skillmapping.json', {}), indent=None)
    demand_summary = json.dumps(DATASETS.get('ondemandjobs.json', {}), indent=None)
    workforce_summary = json.dumps(DATASETS.get('workforce.json', {}), indent=None)
    graduatestats = json.dumps(DATASETS.get('graduatestats.json', {}), indent=None)
    courseinfo_summary = json.dumps(DATASETS.get('courseinfo.csv', []), indent=None)
    job_summary = json.dumps(DATASETS.get('job.csv', []), indent=None)


    client = OpenAI(
        api_key=os.getenv("ZAI_API_KEY"),
        base_url="https://api.ilmu.ai/v1",
    )
    
    content = f"""
    You are a career consultant with access to real market data.

    Here are some market data, use these to ground your recommendations and give accurate and concise responses
    Market analysis: {market_summary}
    In-demand jobs: {demand_summary}
    Career paths: {careers_summary}
    Skill mappings: {skills_summary}
    Workforce info: {workforce_summary}
    Graduate statistics: {graduatestats}
    Course information: {courseinfo_summary}
    Job information: {job_summary}


    Given this person's profile: {profile.description}

    Give your recommendations on what this person should do with their career and future.
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
                "next_steps": "..."
            }}
        ]
    }}

    You can include more or fewer careers depending on what fits this person.
    """

    response = client.chat.completions.create(
        model="ilmu-glm-5.1",
        messages=[
            {"role": "system", "content": "You are an expert career consultant. Always respond with valid JSON only."},
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

