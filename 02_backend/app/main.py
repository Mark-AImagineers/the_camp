import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TheCamp API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_version() -> dict:
    version_file = Path("/version.json")
    if version_file.exists():
        return json.loads(version_file.read_text())
    return {"version": "unknown"}


@app.get("/health")
def health():
    info = _load_version()
    return {"status": "ok", "version": info.get("version", "unknown"), "service": "thecamp-api"}
