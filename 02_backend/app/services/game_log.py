import random
from datetime import datetime, timezone
from pathlib import Path

import yaml


_clock_config: dict | None = None


def _load_clock_config() -> dict:
    global _clock_config
    if _clock_config:
        return _clock_config
    for p in [Path("/app/06_gamedata/config/world_clock.yaml"), Path("06_gamedata/config/world_clock.yaml")]:
        if p.exists():
            _clock_config = yaml.safe_load(p.read_text())
            return _clock_config
    return {"epoch": "2026-03-28T00:00:00Z", "real_hours_per_game_day": 8}


def get_current_game_day() -> int:
    config = _load_clock_config()
    epoch = datetime.fromisoformat(config["epoch"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    elapsed_hours = (now - epoch).total_seconds() / 3600
    return max(1, int(elapsed_hours / config["real_hours_per_game_day"]) + 1)


def insert_event(cur, save_slot_id: str, event_type: str, text: str, context: dict | None = None, game_day: int | None = None):
    if game_day is None:
        game_day = get_current_game_day()
    cur.execute(
        """INSERT INTO game.game_events (save_slot_id, event_type, text, context, game_day)
           VALUES (%s, %s, %s, %s::jsonb, %s)""",
        (save_slot_id, event_type, text, __import__("json").dumps(context or {}), game_day),
    )


def get_events(cur, save_slot_id: str, limit: int = 100) -> list[dict]:
    cur.execute(
        """SELECT id, event_type, text, context, game_day, created_at
           FROM game.game_events
           WHERE save_slot_id = %s
           ORDER BY created_at ASC
           LIMIT %s""",
        (save_slot_id, limit),
    )
    return [
        {
            "id": r[0],
            "event_type": r[1],
            "text": r[2],
            "context": r[3],
            "game_day": r[4],
            "created_at": str(r[5]),
        }
        for r in cur.fetchall()
    ]


def format_log_message(templates: list[str], survivor: str, target: str | None = None) -> str:
    template = random.choice(templates)
    msg = template.replace("{survivor}", survivor)
    if target:
        msg = msg.replace("{target}", target)
    return msg
