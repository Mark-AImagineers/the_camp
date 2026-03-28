import json
import re
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yaml

from app.api.auth import router as auth_router
from app.api.save_slots import router as save_slots_router
from app.core.database import get_db

app = FastAPI(title="TheCamp API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(save_slots_router, prefix="/save-slots")


def _load_version() -> dict:
    version_file = Path("/version.json")
    if version_file.exists():
        return json.loads(version_file.read_text())
    return {"version": "unknown"}


@app.get("/health")
def health():
    info = _load_version()
    return {"status": "ok", "version": info.get("version", "unknown"), "service": "thecamp-api"}


def _load_world_clock_config() -> dict:
    paths = [
        Path("/app/06_gamedata/config/world_clock.yaml"),
        Path("06_gamedata/config/world_clock.yaml"),
    ]
    for p in paths:
        if p.exists():
            return yaml.safe_load(p.read_text())
    return {}


@app.get("/world-clock")
def world_clock():
    config = _load_world_clock_config()
    if not config:
        raise HTTPException(status_code=503, detail="World clock config not found")
    return {
        "epoch": config["epoch"],
        "real_hours_per_game_day": config["real_hours_per_game_day"],
        "starting_year": config["starting_year"],
        "starting_month": config.get("starting_month", 1),
        "starting_day": config["starting_day"],
    }


class WaitlistRequest(BaseModel):
    email: str


EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


@app.post("/waitlist", status_code=201)
def join_waitlist(req: WaitlistRequest):
    if not EMAIL_RE.match(req.email):
        raise HTTPException(status_code=400, detail="Invalid email")
    try:
        conn = get_db()
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
