import json
import random
from pathlib import Path


def _load_lore_characters() -> list[dict]:
    paths = [
        Path("/app/06_gamedata/survivors/lore_characters.json"),
        Path("06_gamedata/survivors/lore_characters.json"),
    ]
    for p in paths:
        if p.exists():
            return json.loads(p.read_text())
    raise FileNotFoundError("lore_characters.json not found")


def _roll_stats(stat_bias: list[str]) -> dict[str, int]:
    stats = {
        "strength": random.randint(3, 7),
        "agility": random.randint(3, 7),
        "perception": random.randint(3, 7),
        "endurance": random.randint(3, 7),
        "luck": random.randint(3, 7),
    }
    for bias in stat_bias:
        if bias in stats:
            stats[bias] += 2
    # variance
    for key in stats:
        stats[key] += random.randint(-1, 1)
        stats[key] = max(1, min(10, stats[key]))
    return stats


def seed_survivors(cur, save_slot_id: str):
    """Seed all 15 lore characters for a new save slot. 5 random activated, 10 not."""
    characters = _load_lore_characters()
    random.shuffle(characters)

    starters = characters[:5]
    rest = characters[5:]

    for char in starters:
        _insert_survivor(cur, save_slot_id, char, is_activated=True)

    for char in rest:
        _insert_survivor(cur, save_slot_id, char, is_activated=False)


def _insert_survivor(cur, save_slot_id: str, char: dict, is_activated: bool):
    stats = _roll_stats(char.get("stat_bias", []))
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
