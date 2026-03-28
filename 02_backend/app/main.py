import json
import os
import re
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="TheCamp API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.environ.get("DATABASE_URL", "")


def _get_db():
    import psycopg2
    return psycopg2.connect(DATABASE_URL)


def _load_version() -> dict:
    version_file = Path("/version.json")
    if version_file.exists():
        return json.loads(version_file.read_text())
    return {"version": "unknown"}


@app.get("/health")
def health():
    info = _load_version()
    return {"status": "ok", "version": info.get("version", "unknown"), "service": "thecamp-api"}


class WaitlistRequest(BaseModel):
    email: str


EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


@app.post("/waitlist", status_code=201)
def join_waitlist(req: WaitlistRequest):
    if not EMAIL_RE.match(req.email):
        raise HTTPException(status_code=400, detail="Invalid email")
    if not DATABASE_URL:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        conn = _get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO auth.waitlist (email) VALUES (%s) ON CONFLICT (email) DO NOTHING",
            (req.email.lower().strip(),),
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"message": "You're on the list."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
