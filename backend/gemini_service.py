import os
import re
from groq import Groq
from dotenv import load_dotenv
from db_service import get_schema

load_dotenv()

client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = "llama-3.3-70b-versatile"

_history: list[dict] = []
MAX_HISTORY = 6


def reset_history():
    global _history
    _history = []


def _schema_with_hints() -> str:
    schema = get_schema()
    return schema


def nl_to_sql(user_question: str) -> str:
    schema = _schema_with_hints()

    history_text = ""
    if _history:
        history_text = "\nConversation so far:\n"
        for h in _history[-MAX_HISTORY:]:
            history_text += f"User: {h['question']}\nSQL: {h['sql']}\n"

    system_prompt = f"""You are an expert SQLite SQL generator. Your only job is to convert natural language questions into correct SQLite SELECT queries.

Database schema:
{schema}

Table relationships:
- sales.product_id → products.id
- sales.employee_id → employees.id

Rules:
- Only generate SELECT statements — never INSERT, UPDATE, DELETE, DROP, or UPDATE.
- Use exact table and column names from the schema above.
- For revenue/profit/quantity aggregations, JOIN the sales table and use SUM() with GROUP BY.
- Always SELECT both label columns (name, category, region) AND numeric columns (revenue, profit).
- For "top N" questions use ORDER BY ... DESC LIMIT N.
- sale_date is stored as TEXT in 'YYYY-MM-DD' format. Use strftime() or string comparison for date filtering.
- Output ONLY the raw SQL query. No explanations, no markdown, no backticks, no comments.
{history_text}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_question},
        ],
        temperature=0,
        max_tokens=512,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```(?:sql)?", "", raw, flags=re.IGNORECASE).strip()
    raw = re.sub(r"```$", "", raw).strip()

    _history.append({"question": user_question, "sql": raw})
    return raw


def summarize_results(question: str, columns: list, rows: list) -> str:
    if not rows:
        return "No results found for your query."

    preview = ", ".join(columns) + "\n"
    for row in rows[:10]:
        preview += ", ".join(str(v) for v in row) + "\n"
    if len(rows) > 10:
        preview += f"... and {len(rows) - 10} more rows"

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "You summarize database query results in 1-2 plain English sentences. Be specific — include actual numbers and names from the data.",
            },
            {
                "role": "user",
                "content": f"Question: {question}\n\nData:\n{preview}\n\nSummary:",
            },
        ],
        temperature=0.3,
        max_tokens=150,
    )

    return response.choices[0].message.content.strip()
