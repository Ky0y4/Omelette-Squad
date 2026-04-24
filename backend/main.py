from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

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
    return {
        "summary": "You have a strong profile for technical leadership and software development.",
        "top_careers": [
            {
                "role": "Senior Full Stack Engineer",
                "match_score": 95,
                "why_it_fits": "Your experience with React and Python aligns perfectly with modern web stacks.",
                "trade_offs": "Higher responsibility and potential for on-call hours.",
                "next_steps": "1. Master System Design\n2. Learn cloud architecture (AWS/GCP)\n3. Contribute to open source."
            },
            {
                "role": "AI Solutions Architect",
                "match_score": 88,
                "why_it_fits": "Your interest in AI and solving complex problems is a great fit for architecting intelligent systems.",
                "trade_offs": "Requires keeping up with very rapid research changes.",
                "next_steps": "1. Study LLM orchestration\n2. Get certified in Machine Learning\n3. Build a portfolio of AI agents."
            }
        ]
    }
