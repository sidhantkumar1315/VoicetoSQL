import csv
import io
import os
import sqlite3
import tempfile

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from gemini_service import nl_to_sql, summarize_results, reset_history
from db_service import run_query, get_schema, get_schema_structured, set_db_path, DEFAULT_DB_PATH

app = FastAPI(title="VoiceToSQL API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track uploaded temp files so we can clean up if needed
_uploaded_db_path: str | None = None


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    question: str
    sql: str
    columns: list
    rows: list
    summary: str
    row_count: int


@app.get("/")
def root():
    return {"message": "VoiceToSQL API is running"}


@app.get("/schema")
def schema():
    return {"schema": get_schema(), "tables": get_schema_structured()}


@app.post("/reset")
def reset():
    """Switch back to the built-in demo database."""
    global _uploaded_db_path
    set_db_path(DEFAULT_DB_PATH)
    reset_history()
    _uploaded_db_path = None
    return {"message": "Reset to demo database.", "tables": get_schema_structured()}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global _uploaded_db_path

    filename = file.filename or ""
    content = await file.read()

    if filename.endswith(".db") or filename.endswith(".sqlite"):
        db_path = _save_temp_db(content)

    elif filename.endswith(".csv"):
        db_path = _csv_to_sqlite(content, filename)

    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a .db, .sqlite, or .csv file.",
        )

    set_db_path(db_path)
    reset_history()
    _uploaded_db_path = db_path

    return {
        "message": f"'{filename}' loaded successfully.",
        "tables": get_schema_structured(),
    }


def _save_temp_db(content: bytes) -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    tmp.write(content)
    tmp.close()
    return tmp.name


def _csv_to_sqlite(content: bytes, filename: str) -> str:
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    rows = list(reader)

    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty.")

    # Derive table name from filename (strip extension, sanitize)
    table_name = os.path.splitext(filename)[0]
    table_name = "".join(c if c.isalnum() or c == "_" else "_" for c in table_name)
    if table_name[0].isdigit():
        table_name = "t_" + table_name

    columns = list(rows[0].keys())

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    tmp.close()

    conn = sqlite3.connect(tmp.name)
    cursor = conn.cursor()

    col_defs = ", ".join(f'"{col}" TEXT' for col in columns)
    cursor.execute(f'CREATE TABLE "{table_name}" ({col_defs})')

    placeholders = ", ".join("?" for _ in columns)
    values = [[row.get(col, "") for col in columns] for row in rows]
    cursor.executemany(f'INSERT INTO "{table_name}" VALUES ({placeholders})', values)

    conn.commit()
    conn.close()

    return tmp.name


@app.post("/query", response_model=QueryResponse)
def query(request: QueryRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        sql = nl_to_sql(question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    try:
        result = run_query(sql)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    summary = summarize_results(question, result["columns"], result["rows"])

    return QueryResponse(
        question=question,
        sql=sql,
        columns=result["columns"],
        rows=result["rows"],
        summary=summary,
        row_count=len(result["rows"]),
    )
