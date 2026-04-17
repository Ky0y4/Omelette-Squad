from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# THIS LINE IS MAGIC. It stops the "CORS error" from ruining your life.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_data(file: UploadFile = File(...)):
    # You will put your Pandas + Z.AI logic here later
    return {
        "decision": "Do not take the highway",
        "reasoning": "Police roadblock will spoil the fish",
        "tradeoff": "Pay RM30 extra for the toll road"
    }