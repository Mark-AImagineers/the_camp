import json
import random
from pathlib import Path


def _load_character_file(f: Path) -> dict:
    """Load and flatten a single character JSON file."""
    data = json.loads(f.read_text())
    return {
        "lore_id": data["lore_id"],
        "name": data["name"],
        "background": data["identity"]["background"],
        "background_detail": data["identity"].get("background_detail"),
        "age_bracket": data["identity"].get("age_bracket"),
        "persona": data["personality"].get("persona"),
        "trait": data["personality"].get("trait"),
        "trait_description": data["personality"].get("trait_description"),
        "stat_bias": data["stats"].get("bias", []),
        "base_range": data["stats"].get("base_range", [3, 7]),
        "base_relationship": data["relationships"].get("base_strength", 30),
        "can_deploy": data["flags"].get("can_deploy", True),
    }


def _load_lore_characters() -> tuple[list[dict], list[dict]]:
    """Load character files from deployable/ and non_deployable/ folders.
    Returns (deployable, non_deployable) tuple."""
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


def _roll_stats(stat_bias: list[str], base_range: list[int] = None) -> dict[str, int]:
    low, high = base_range or [3, 7]
    stats = {
        "strength": random.randint(low, high),
        "agility": random.randint(low, high),
        "perception": random.randint(low, high),
        "endurance": random.randint(low, high),
        "luck": random.randint(low, high),
    }
    for bias in stat_bias:
        if bias in stats:
            stats[bias] += 2
    for key in stats:
        stats[key] += random.randint(-1, 1)
        stats[key] = max(1, min(10, stats[key]))
    return stats


def seed_survivors(cur, save_slot_id: str):
    """Seed all lore characters for a new save slot. 5 random deployable ones activated, rest not."""
    deployable, non_deployable = _load_lore_characters()

    # Pick 5 random starters from deployable pool
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
    stats = _roll_stats(char.get("stat_bias", []), char.get("base_range"))
    max_hp = 50 + (stats["endurance"] * 10)

    cur.execute(
        """INSERT INTO game.survivors (
            save_slot_id, lore_id, name, background, background_detail,
            age_bracket, persona, trait, trait_description,
            strength, agility, perception, endurance, luck,
            hp, max_hp, condition, is_activated,
            relationship_strength, morale_modifier
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, 'healthy', %s,
            %s, 0
        )""",
        (
            save_slot_id,
            char["lore_id"],
            char["name"],
            char["background"],
            char.get("background_detail"),
            char.get("age_bracket"),
            char.get("persona"),
            char.get("trait"),
            char.get("trait_description"),
            stats["strength"],
            stats["agility"],
            stats["perception"],
            stats["endurance"],
            stats["luck"],
            max_hp,
            max_hp,
            is_activated,
            char.get("base_relationship", 30),
        ),
    )
