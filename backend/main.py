from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re


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
    print(f"I RECEIVED DA DATA: {profile.description}")
    try:
        result = await get_response(profile)
        print(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_response(profile: UserProfile) -> dict:
    print("GENERATING RESPONSE TIME")

    client = OpenAI(
        api_key=os.getenv("ZAI_API_KEY"),
        base_url="https://api.ilmu.ai/v1",
    )
    
    content = f"""
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

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()

    return json.loads(raw)


