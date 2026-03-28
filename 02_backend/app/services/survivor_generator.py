import json
import random
from pathlib import Path


def _load_character_file(f: Path) -> dict:
    """Load and flatten a single character JSON file."""
    data = json.loads(f.read_text())
    stats = data.get("stats", {})
    return {
        "lore_id": data["lore_id"],
        "name": data["name"],
        "background": data["identity"]["background"],
        "background_detail": data["identity"].get("background_detail"),
        "age": data["identity"].get("age"),
        "persona": data["personality"].get("persona"),
        "stats": stats,
        "traits": data.get("traits", []),
        "skills": data.get("skills", []),
        "starting_inventory": data.get("starting_inventory", []),
        "rations": data.get("rations", 0),
        "base_relationship": data["relationships"].get("base_strength", 30),
        "can_deploy": data["flags"].get("can_deploy", True),
    }


def _load_lore_characters() -> tuple[list[dict], list[dict]]:
    """Load character files from deployable/ and non_deployable/ folders."""
    search_paths = [
        Path("/app/06_gamedata/survivors"),
        Path("06_gamedata/survivors"),
    ]
    for base in search_paths:
        deployable_dir = base / "deployable"
        non_deployable_dir = base / "non_deployable"
        if deployable_dir.is_dir():
            deployable = [_load_character_file(f) for f in sorted(deployable_dir.glob("*.json"))]
            non_deployable = []
            if non_deployable_dir.is_dir():
                non_deployable = [_load_character_file(f) for f in sorted(non_deployable_dir.glob("*.json"))]
            return deployable, non_deployable
    raise FileNotFoundError("No character files found in survivors gamedata")


def seed_survivors(cur, save_slot_id: str):
    """Seed all lore characters for a new save slot. 5 random deployable ones activated, rest not."""
    deployable, non_deployable = _load_lore_characters()

    random.shuffle(deployable)
    starters = deployable[:5]
    rest_deployable = deployable[5:]

    for char in starters:
        _insert_survivor(cur, save_slot_id, char, is_activated=True)

    for char in rest_deployable:
        _insert_survivor(cur, save_slot_id, char, is_activated=False)

    for char in non_deployable:
        _insert_survivor(cur, save_slot_id, char, is_activated=False)


def _insert_survivor(cur, save_slot_id: str, char: dict, is_activated: bool):
    stats = char.get("stats", {})

    # Extract base values
    str_val = stats.get("str", {}).get("base", 3)
    dex_val = stats.get("dex", {}).get("base", 3)
    agi_val = stats.get("agi", {}).get("base", 3)
    per_val = stats.get("per", {}).get("base", 3)
    end_val = stats.get("end", {}).get("base", 3)
    int_val = stats.get("int", {}).get("base", 3)
    lck_val = stats.get("lck", {}).get("base", 3)
    hp_val = stats.get("hp", {}).get("base", 100)

    # Build growth multiplier map
    stat_growth = {}
    for key in ["str", "dex", "agi", "per", "end", "int", "lck", "hp"]:
        stat_growth[key] = stats.get(key, {}).get("growth", 1.0)

    cur.execute(
        """INSERT INTO game.survivors (
            save_slot_id, lore_id, name, background, background_detail,
            age, persona,
            str, dex, agi, per, endurance, int_stat, lck,
            hp, max_hp, condition, is_activated,
            stat_growth, traits, skills, starting_inventory, rations,
            relationship_strength, morale_modifier
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s,
            %s, %s, %s, %s, %s, %s, %s,
            %s, %s, 'healthy', %s,
            %s, %s, %s, %s, %s,
            %s, 0
        )""",
        (
            save_slot_id,
            char["lore_id"],
            char["name"],
            char["background"],
            char.get("background_detail"),
            char.get("age"),
            char.get("persona"),
            str_val, dex_val, agi_val, per_val, end_val, int_val, lck_val,
            hp_val, hp_val,
            is_activated,
            json.dumps(stat_growth),
            json.dumps(char.get("traits", [])),
            json.dumps(char.get("skills", [])),
            json.dumps(char.get("starting_inventory", [])),
            char.get("rations", 0),
            char.get("base_relationship", 30),
        ),
    )
