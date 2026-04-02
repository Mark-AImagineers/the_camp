import json

from openai import OpenAI

from app.core.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

EVAL_SYSTEM_PROMPT = """You evaluate conversation exchanges in a post-apocalyptic survivor camp between a player (camp leader) and a survivor.

Return ONLY a JSON object with these fields:
- tag: emotional summary of the exchange in 5-10 words (e.g. "player was supportive about Otto", "player dismissed food concerns")
- sentiment: one of "positive", "negative", "neutral", "mixed"
- sentiment_score: integer from -100 (extremely hostile) to 100 (deeply compassionate). 0 is neutral.
- promise_made: boolean — did the player make a commitment or promise?
- promise_text: if promise_made is true, what was promised (short phrase). null otherwise.
- topics: list of 1-3 key topics discussed (short words like "safety", "food", "otto", "past")

Be precise. A casual greeting is neutral (score 0). Genuine kindness is positive (30-60). Cruelty is negative (-50 to -80). Threats are deeply negative (-80 to -100)."""


def evaluate_exchange(
    survivor_name: str,
    player_message: str,
    survivor_response: str,
    config: dict,
) -> dict | None:
    if not client:
        return None

    eval_config = config.get("evaluation", {})
    model = eval_config.get("model", "gpt-4o-mini")
    max_tokens = eval_config.get("max_tokens", 200)
    temperature = eval_config.get("temperature", 0.3)

    user_prompt = f'Player said to {survivor_name}: "{player_message}"\n{survivor_name} responded: "{survivor_response}"'

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": EVAL_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
            temperature=temperature,
        )

        content = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

        return json.loads(content)
    except Exception:
        return None
