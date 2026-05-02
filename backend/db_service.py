import sqlite3
import os

DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "business.db")

# Active DB path — can be swapped by upload
_active_db_path = DEFAULT_DB_PATH


def set_db_path(path: str):
    global _active_db_path
    _active_db_path = path


def get_db_path() -> str:
    return _active_db_path


def get_connection():
    conn = sqlite3.connect(_active_db_path)
    conn.row_factory = sqlite3.Row
    return conn


def get_schema() -> str:
    """Return schema as a string for the AI prompt."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]

    schema_parts = []
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        col_defs = ", ".join(f"{col[1]} {col[2]}" for col in columns)
        schema_parts.append(f"Table: {table} ({col_defs})")

    conn.close()
    return "\n".join(schema_parts)


def get_schema_structured() -> list[dict]:
    """Return schema as a list of {table, columns} for the frontend."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]

    result = []
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [{"name": col[1], "type": col[2]} for col in cursor.fetchall()]

        cursor.execute(f"SELECT COUNT(*) FROM '{table}'")
        row_count = cursor.fetchone()[0]

        result.append({"table": table, "columns": columns, "row_count": row_count})

    conn.close()
    return result


def run_query(sql: str) -> dict:
    """Run a SELECT query and return rows + column names."""
    sql = sql.strip().rstrip(";")

    # Safety: only allow SELECT
    if not sql.upper().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed.")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(sql)
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    conn.close()

    return {
        "columns": columns,
        "rows": [list(row) for row in rows],
    }
