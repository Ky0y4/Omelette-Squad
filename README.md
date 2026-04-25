# Video Presentation
https://drive.google.com/file/d/1iW3hSDBg0Ml8gpB7dyaxM6EQcdsSnEdY/view?usp=sharing

# Omelette Squad — Career Decision Intelligence Advisor

An AI-powered career advisor that cross-references your personal profile against real Malaysian market data to deliver data-backed career recommendations — not generic advice.

Built for **Hackathon 2026**.

---

## What It Does

Users describe their background across five structured fields, optionally upload a resume (PDF or DOCX), and the system returns ranked career recommendations grounded in:

- **MyCOL 2024/25** — workforce criticality and role safety scores
- **DOSM 2024** — median salary and regional wage data
- **FSF 2025** — future skills and upskilling recommendations
- Live job demand signals, career path data, graduate statistics, and course fee information

Each recommendation includes a match score, financial ROI calculation, break-even analysis, risk warnings, and a concrete next steps plan.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 18 |
| Backend | FastAPI, Python 3.11 |
| AI | Google Gemini (`gemini-2.0-flash`) |
| File Parsing | PyMuPDF (PDF), python-docx (DOCX) |
| Containerisation | Docker, Docker Compose |

---

## Project Structure

```
Omelette-Squad/
├── backend/
│   ├── main.py          # FastAPI app, /analyze endpoint, AI prompt logic
│   ├── loadData.py      # Loads all datasets into memory at startup
│   ├── readFiles.py     # PDF and DOCX text extraction
│   ├── requirements.txt
│   └── Dockerfile
├── career-advisor/      # Next.js frontend
│   ├── app/
│   │   └── page.js      # Main page, handles form submission and results
│   ├── components/
│   │   ├── UserForm.jsx      # 5-field input form + file upload
│   │   ├── ResultsPanel.jsx  # Career cards with scores and analysis
│   │   └── *.css
│   └── Dockerfile
├── data/                # Market datasets (JSON + CSV)
│   ├── workforce.json
│   ├── marketanalysis.json
│   ├── skillmapping.json
│   ├── ondemandjobs.json
│   ├── careers.json
│   ├── graduatestats.json
│   ├── courseinfo.csv
│   └── job.csv
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone the repo

```bash
git clone https://github.com/your-org/Omelette-Squad.git
cd Omelette-Squad
```

### 2. Set up environment variables

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

A template is provided at `.env_example`.

### 3. Run with Docker Compose

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### 4. To stop

```bash
docker compose down
```

---

## How to Use

1. **Fill in your profile** — education level, technical skills, tasks you enjoy, ideal work environment, and target salary/location.
2. **Upload your resume** (optional) — PDF or DOCX. The system extracts and appends the content automatically.
3. **Click "Get Career Recommendations"** — the AI cross-references your profile against all market datasets.
4. **Review your results** — each career card shows:
   - Match score and final weighted score
   - ROI percentage and break-even years
   - Financial tags (e.g. "High Return Career", "Fast Payback")
   - Risk warnings (e.g. "Potential debt trap")
   - Why it fits, trade-offs, next steps
   - Market reality, economic forecast, and skill-up strategy

---

## API Reference

### `POST /analyze`

Accepts `multipart/form-data`.

| Field | Type | Required | Description |
|---|---|---|---|
| `description` | string | Yes | Structured profile description |
| `timestamp` | string | Yes | ISO 8601 timestamp |
| `budget_constraint` | string | No | `low`, `medium`, or `high` (default: `medium`) |
| `risk_tolerance` | string | No | `low`, `medium`, or `high` (default: `low`) |
| `file` | file | No | PDF or DOCX resume |

**Response:**

```json
{
  "summary": "...",
  "top_careers": [
    {
      "role": "...",
      "match_score": 90,
      "final_score": 85,
      "roe_percentage": 250,
      "break_even_years": 2.5,
      "financial_tags": ["High Return Career"],
      "risk_warnings": [],
      "why_it_fits": "...",
      "trade_offs": "...",
      "next_steps": "...",
      "market_reality": "...",
      "economic_forecast": "...",
      "optimization_strategy": "...",
      "decision_impact": "..."
    }
  ]
}
```

---

## Development (without Docker)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd career-advisor
npm install
npm run dev
```

---

## Team

**Omelette Squad** — Hackathon 2026
