import json
import random
from pathlib import Path

import yaml

from app.services.game_log import insert_event, format_log_message, get_current_game_day

_rules_config: dict | None = None
_relationships_map: dict | None = None


def load_chat_rules() -> dict:
    global _rules_config
    if _rules_config:
        return _rules_config
    for p in [Path("/app/06_gamedata/config/chat_rules.yaml"), Path("06_gamedata/config/chat_rules.yaml")]:
        if p.exists():
            _rules_config = yaml.safe_load(p.read_text())
            return _rules_config
    return {}


def _load_relationships_map() -> dict[str, list[str]]:
    """Load key_relationships from survivor lore JSONs. Cached at module level."""
    global _relationships_map
    if _relationships_map is not None:
        return _relationships_map

    _relationships_map = {}
    for base in [Path("/app/06_gamedata/survivors"), Path("06_gamedata/survivors")]:
        if not base.exists():
            continue
        for sub in ["deployable", "non_deployable"]:
            d = base / sub
            if not d.exists():
                continue
            for f in d.glob("*.json"):
                data = json.loads(f.read_text())
                lore_id = data.get("lore_id", "")
                rels = data.get("relationships", {}).get("key_relationships", {})
                _relationships_map[lore_id] = [k for k in rels.keys() if k != "mark"]
        if _relationships_map:
            break
    return _relationships_map


def get_hard_boundaries(lore_id: str, relationship_strength: int) -> list[dict]:
    """Return active hard boundaries for a survivor at given trust level."""
    config = load_chat_rules()
    boundaries = config.get("hard_boundaries", {}).get(lore_id, [])
    active = []
    for b in boundaries:
        if relationship_strength < b.get("threshold", 100):
            active.append(b)
    return active


def get_recent_emotional_tags(cur, save_slot_id: str, survivor_id: str, limit: int = 10) -> list[dict]:
    """Load recent emotional tags for injection into system prompt."""
    cur.execute(
        """SELECT tag, sentiment, promise_made, promise_text, game_day
           FROM game.emotional_tags
           WHERE save_slot_id = %s AND survivor_id = %s AND is_active = TRUE
           ORDER BY created_at DESC
           LIMIT %s""",
        (save_slot_id, survivor_id, limit),
    )
    return [
        {
            "tag": r[0],
            "sentiment": r[1],
            "promise_made": r[2],
            "promise_text": r[3],
            "game_day": r[4],
        }
        for r in cur.fetchall()
    ]


def apply_consequences(
    cur,
    save_slot_id: str,
    survivor_id: str,
    survivor: dict,
    evaluation: dict,
    game_day: int | None = None,
):
    """Apply relationship delta, store emotional tag, generate log entries."""
    config = load_chat_rules()
    if game_day is None:
        game_day = get_current_game_day()

    sentiment = evaluation.get("sentiment", "neutral")
    tag = evaluation.get("tag", "")
    sentiment_score = evaluation.get("sentiment_score", 0)
    promise_made = evaluation.get("promise_made", False)
    promise_text = evaluation.get("promise_text")
    topics = evaluation.get("topics", [])

    # 1. Store emotional tag
    cur.execute(
        """INSERT INTO game.emotional_tags
           (save_slot_id, survivor_id, tag, sentiment, sentiment_score, promise_made, promise_text, context, game_day)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)""",
        (
            save_slot_id, survivor_id, tag, sentiment, sentiment_score,
            promise_made, promise_text,
            json.dumps({"topics": topics}),
            game_day,
        ),
    )

    # 2. Apply relationship delta
    deltas = config.get("relationship_deltas", {})
    delta = deltas.get(sentiment, 0)
    r_range = config.get("relationship_range", {"min": 0, "max": 100})

    if delta != 0:
        cur.execute(
            """UPDATE game.survivors
               SET relationship_strength = GREATEST(%s, LEAST(%s, relationship_strength + %s))
               WHERE id = %s AND save_slot_id = %s""",
            (r_range["min"], r_range["max"], delta, survivor_id, save_slot_id),
        )

    # 3. Social log entry (probability gated)
    log_probability = config.get("social_log_probability", 0.4)
    log_messages = config.get("log_messages", {})
    survivor_name = survivor.get("name", "Someone")

    if delta != 0 and random.random() < log_probability:
        if sentiment in ("positive", "mixed"):
            templates = log_messages.get("social_positive", [])
        else:
            templates = log_messages.get("social_negative", [])

        if templates:
            msg = format_log_message(templates, survivor_name)
            # Dedup: check if same survivor got a social log entry today
            cur.execute(
                """SELECT 1 FROM game.game_events
                   WHERE save_slot_id = %s AND event_type = 'social'
                   AND context->>'survivor_name' = %s AND game_day = %s
                   LIMIT 1""",
                (save_slot_id, survivor_name, game_day),
            )
            if not cur.fetchone():
                insert_event(
                    cur, save_slot_id, "social", msg,
                    context={"survivor_name": survivor_name, "sentiment": sentiment},
                    game_day=game_day,
                )

    # 4. Promise log entry
    if promise_made and promise_text:
        promise_templates = log_messages.get("promise_made", [])
        if promise_templates:
            msg = format_log_message(promise_templates, survivor_name)
            insert_event(
                cur, save_slot_id, "social", msg,
                context={"survivor_name": survivor_name, "promise": promise_text},
                game_day=game_day,
            )

    # 5. Social ripple
    ripple_config = config.get("social_ripple", {})
    if ripple_config.get("enabled", False) and delta != 0:
        _apply_social_ripple(cur, save_slot_id, survivor, delta, ripple_config, log_messages, game_day)


def _apply_social_ripple(
    cur,
    save_slot_id: str,
    survivor: dict,
    primary_delta: int,
    ripple_config: dict,
    log_messages: dict,
    game_day: int,
):
    """Apply diluted relationship delta to connected survivors."""
    lore_id = survivor.get("lore_id", "")
    survivor_name = survivor.get("name", "")
    relationships_map = _load_relationships_map()
    connected = relationships_map.get(lore_id, [])

    if not connected:
        return

    default_mult = ripple_config.get("default_multiplier", 0.3)
    overrides = ripple_config.get("relationship_multipliers", {})
    r_range_cfg = load_chat_rules().get("relationship_range", {"min": 0, "max": 100})
    log_probability = load_chat_rules().get("social_log_probability", 0.4)

    for connected_lore_id in connected:
        mult = overrides.get(lore_id, {}).get(connected_lore_id, default_mult)
        ripple_delta = int(round(primary_delta * mult))
        if ripple_delta == 0:
            continue

        # Update connected survivor's relationship
        cur.execute(
            """UPDATE game.survivors
               SET relationship_strength = GREATEST(%s, LEAST(%s, relationship_strength + %s))
               WHERE lore_id = %s AND save_slot_id = %s
               RETURNING name""",
            (r_range_cfg["min"], r_range_cfg["max"], ripple_delta, connected_lore_id, save_slot_id),
        )
        row = cur.fetchone()
        if not row:
            continue

        connected_name = row[0]

        # Ripple log entry (probability gated)
        if random.random() < log_probability:
            if ripple_delta > 0:
                templates = log_messages.get("social_ripple_positive", [])
            else:
                templates = log_messages.get("social_ripple_negative", [])

            if templates:
                msg = format_log_message(templates, connected_name, target=survivor_name)
                insert_event(
                    cur, save_slot_id, "social", msg,
                    context={"survivor_name": connected_name, "target_name": survivor_name, "ripple": True},
                    game_day=game_day,
                )
