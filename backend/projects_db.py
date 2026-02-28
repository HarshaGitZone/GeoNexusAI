import sqlite3
import json
from datetime import datetime

DB_PATH = "projects.db"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        name TEXT NOT NULL,
        payload TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()


def save_project(project_id, name, payload):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    now = datetime.utcnow().isoformat()

    cur.execute("""
    INSERT INTO projects (id, created_at, updated_at, name, payload)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      updated_at = excluded.updated_at,
      name = excluded.name,
      payload = excluded.payload
    """, (project_id, now, now, name, json.dumps(payload)))

    conn.commit()
    conn.close()


def load_project(project_id):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT id, name, created_at, updated_at, payload FROM projects WHERE id = ?", (project_id,))
    row = cur.fetchone()

    conn.close()

    if not row:
        return None

    pid, name, created_at, updated_at, payload = row
    return {
        "id": pid,
        "name": name,
        "created_at": created_at,
        "updated_at": updated_at,
        "payload": json.loads(payload)
    }
