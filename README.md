# VoiceToSQL

An AI-powered web app that converts natural language questions — including voice input — into SQL queries and visualizes the results instantly. No SQL knowledge required.

## Live Demo

**[voiceto-sql.vercel.app](https://voiceto-sql.vercel.app/)**

> **Note:** The backend is hosted on Vercel's free tier and may take up to 30 seconds to respond on the very first query after a period of inactivity (cold start). Subsequent queries will be fast.

## Features

- **Voice Input** — Ask questions with your microphone using the Web Speech API
- **Natural Language → SQL** — Powered by Groq's Llama 3.3 70B LLM
- **Smart Visualizations** — Auto-selects bar or line charts based on data shape
- **Custom Database Upload** — Upload your own `.db`, `.sqlite`, or `.csv` files
- **Conversation History** — Context-aware SQL generation across follow-up questions
- **AI Summaries** — Plain-English summary of every query result
- **Schema Browser** — Explore table structures in the Schema tab
- **Dark Mode** — Full light/dark theme support

## Tech Stack

| Layer    | Technologies                              |
|----------|-------------------------------------------|
| Frontend | React 19, Vite, Recharts, Axios           |
| Backend  | FastAPI, Python, Uvicorn                  |
| AI / LLM | Groq API (Llama 3.3 70B)                 |
| Database | SQLite3                                   |
| Voice    | Web Speech API (browser-native)           |

## Project Structure

```
VoicetoSQL/
├── backend/
│   ├── main.py            # FastAPI app — routes & file upload logic
│   ├── gemini_service.py  # LLM integration (nl_to_sql, summarize)
│   ├── db_service.py      # SQLite query execution & schema extraction
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Root component & state management
│   │   ├── api.js         # Axios API client
│   │   └── components/    # VoiceButton, ResultChart, ResultTable, …
│   └── package.json
└── data/
    ├── business.db        # Demo database (products, employees, sales, expenses)
    └── seed.py
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com)

### Backend

```bash
cd backend
pip install -r requirements.txt

# create .env
echo "GROQ_API_KEY=your_key_here" > .env

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install

# optional: set backend URL (defaults to http://localhost:8000)
echo "VITE_API_URL=http://localhost:8000" > .env

npm run dev
```

Open `http://localhost:5173` in your browser.

## Demo Database

The included `business.db` contains two years of realistic business data:

| Table      | Rows | Description                          |
|------------|------|--------------------------------------|
| products   | 10   | Electronics, Furniture, Stationery   |
| employees  | 8    | Sales, Marketing, Operations         |
| sales      | 600  | 2024–2025 transactions with revenue  |
| expenses   | 100  | Categorized company expenses         |

**Example queries to try:**
- *"Top 5 products by revenue"*
- *"Best performing salesperson"*
- *"Monthly profit trend 2025"*
- *"Total expenses by category"*

## Security

- Only `SELECT` queries are permitted — no destructive SQL is executed
- Uploaded databases are stored in temporary files and not persisted
- LLM API keys are server-side only, never exposed to the client
