import aiosqlite
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "shadowcounsel.db")

async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db

async def init_db():
    """Initialize database tables."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                document_name TEXT NOT NULL,
                document_type TEXT NOT NULL DEFAULT 'unknown',
                status TEXT NOT NULL DEFAULT 'pending',
                language TEXT NOT NULL DEFAULT 'en'
            );
            
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL REFERENCES sessions(id),
                raw_text TEXT NOT NULL,
                extracted_clauses TEXT NOT NULL DEFAULT '[]',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            
            CREATE TABLE IF NOT EXISTS debates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL REFERENCES sessions(id),
                clause_id INTEGER NOT NULL,
                agent TEXT NOT NULL,
                content TEXT NOT NULL,
                risk_level TEXT,
                citations TEXT DEFAULT '[]',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            
            CREATE TABLE IF NOT EXISTS whatif_queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL REFERENCES sessions(id),
                query TEXT NOT NULL,
                response TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
        """)
        await db.commit()

async def create_session(session_id: str, document_name: str, document_type: str = "unknown", language: str = "en") -> str:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO sessions (id, document_name, document_type, language) VALUES (?, ?, ?, ?)",
            (session_id, document_name, document_type, language)
        )
        await db.commit()
    return session_id

async def update_session_status(session_id: str, status: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE sessions SET status = ? WHERE id = ?", (status, session_id))
        await db.commit()

async def save_document(session_id: str, raw_text: str, extracted_clauses: list):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO documents (session_id, raw_text, extracted_clauses) VALUES (?, ?, ?)",
            (session_id, raw_text, json.dumps(extracted_clauses))
        )
        await db.commit()

async def save_debate_entry(session_id: str, clause_id: int, agent: str, content: str, risk_level: str = None, citations: list | None = None):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO debates (session_id, clause_id, agent, content, risk_level, citations) VALUES (?, ?, ?, ?, ?, ?)",
            (session_id, clause_id, agent, content, risk_level, json.dumps(citations or []))
        )
        await db.commit()

async def save_whatif_query(session_id: str, query: str, response: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO whatif_queries (session_id, query, response) VALUES (?, ?, ?)",
            (session_id, query, json.dumps(response))
        )
        await db.commit()

async def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None

async def get_session_debates(session_id: str) -> List[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM debates WHERE session_id = ? ORDER BY clause_id, id",
            (session_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

async def get_document(session_id: str) -> Optional[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM documents WHERE session_id = ? ORDER BY id DESC LIMIT 1",
            (session_id,)
        )
        row = await cursor.fetchone()
        if row:
            doc = dict(row)
            try:
                doc["extracted_clauses"] = json.loads(doc.get("extracted_clauses", "[]"))
            except Exception:
                doc["extracted_clauses"] = []
            return doc
        return None

async def get_or_extract_clauses(session_id: str) -> List[Dict[str, Any]]:
    """Gets extracted clauses from DB or parses uploaded file on demand."""
    doc = await get_document(session_id)
    if doc and doc.get("extracted_clauses"):
        return doc["extracted_clauses"]

    import glob
    from ocr.pipeline import extract_text
    from ocr.clause_extractor import extract_clauses
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    matches = glob.glob(os.path.join(upload_dir, f"{session_id}.*"))

    if matches:
        file_path = matches[0]
        file_ext = os.path.splitext(file_path)[1].lower()
        try:
            raw_text, _ = await extract_text(file_path, file_ext)
            clauses, _ = await extract_clauses(raw_text)
            clauses_dicts = [
                {
                    "clause_id": c.clause_id,
                    "clause_text": c.clause_text,
                    "category": c.category.value if hasattr(c.category, "value") else str(c.category)
                }
                for c in clauses
            ]
            await save_document(session_id, raw_text, clauses_dicts)
            await update_session_status(session_id, "extracted")
            return clauses_dicts
        except Exception as e:
            print(f"Extraction error for session {session_id}: {e}")

    return []
