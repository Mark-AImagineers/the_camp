from openai import OpenAI

from app.core.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def _get_relationship_label(strength: int) -> str:
    if strength >= 80:
        return "bonded — deeply trusts the player, open and vulnerable"
    if strength >= 60:
        return "loyal — respects and trusts the player, speaks freely"
    if strength >= 40:
        return "trusted — warming up, willing to share some personal thoughts"
    if strength >= 20:
        return "familiar — cautious but cooperative"
    return "stranger — guarded, minimal, does not trust the player yet"


def _build_system_prompt(
    survivor: dict,
    emotional_tags: list[dict] | None = None,
    hard_boundaries: list[dict] | None = None,
) -> str:
    name = survivor["name"]
    background = survivor["background"]
    condition = survivor["condition"]
    rel_strength = survivor["relationship_strength"]
    rel_label = _get_relationship_label(rel_strength)

    persona = survivor.get("persona") or ""
    voice_notes = survivor.get("voice_notes") or ""
    quirks = survivor.get("quirks") or ""

    lines = [
        f"You are {name}, a survivor in a post-apocalyptic camp.",
        f"Background: {background}.",
        f"Current condition: {condition}.",
        f"Relationship with the player (the camp leader): {rel_label} (strength: {rel_strength}/100).",
        "",
        f"Personality: {persona}" if persona else "",
        f"Speech patterns: {voice_notes}" if voice_notes else "",
        f"Quirks: {quirks}" if quirks else "",
    ]

    # Inject emotional memory
    if emotional_tags:
        lines.append("")
        lines.append("Recent history with the player (use this to inform your tone and references):")
        for tag in emotional_tags[:10]:
            day_note = f"(day {tag['game_day']})"
            entry = f"- {tag['tag']} {day_note}"
            if tag.get("promise_made") and tag.get("promise_text"):
                entry += f" [PROMISE: {tag['promise_text']}]"
            lines.append(entry)

    # Inject hard boundaries
    if hard_boundaries:
        lines.append("")
        lines.append("ABSOLUTE BOUNDARIES — you REFUSE to engage with these topics:")
        for b in hard_boundaries:
            lines.append(f"- Topic: {b['topic']} → Respond ONLY with: {b['refusal']}")

    lines.extend([
        "",
        "Rules:",
        f"- You ARE {name}. Never break character. Never mention being an AI.",
        "- Respond naturally in 1-3 sentences. Keep it short — this is conversation, not monologue.",
        "- Your tone, openness, and warmth must match the relationship level above.",
        "- At low trust, be guarded. Don't share personal details. Keep answers minimal.",
        "- At high trust, be warmer and more open. Show you care.",
        "- React to what the player says. If they're rude, respond accordingly for your personality.",
        "- If the player made promises, you may reference them — especially unfulfilled ones.",
        "- Stay in the world. Reference the camp, the situation, other survivors naturally — don't force it.",
        "- Never use emojis. Never use quotation marks around your own speech.",
    ])

    return "\n".join(line for line in lines if line is not None)


def get_survivor_response(
    survivor: dict,
    player_message: str,
    chat_history: list[dict],
    emotional_tags: list[dict] | None = None,
    hard_boundaries: list[dict] | None = None,
) -> str:
    if not client:
        return "..."

    system_prompt = _build_system_prompt(survivor, emotional_tags, hard_boundaries)

    messages = [{"role": "system", "content": system_prompt}]

    for msg in chat_history[-20:]:
        if msg["speaker"] == "player":
            messages.append({"role": "user", "content": msg["text"]})
        else:
            messages.append({"role": "assistant", "content": msg["text"]})

    messages.append({"role": "user", "content": player_message})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=150,
        temperature=0.8,
    )

    return response.choices[0].message.content.strip()
