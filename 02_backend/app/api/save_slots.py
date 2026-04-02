from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import decode_token
from app.services.survivor_generator import seed_survivors
from app.services.chat import get_survivor_response

router = APIRouter()


def _get_user_id(authorization: str) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    payload = decode_token(authorization[7:])
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["sub"]


class CreateSlotRequest(BaseModel):
    slot_number: int
    name: str = "New Game"


@router.get("")
def list_slots(authorization: str = Header()):
    user_id = _get_user_id(authorization)
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SET app.current_user_id = %s", (user_id,))
    cur.execute(
        "SELECT id, slot_number, name, day_count, created_at FROM game.save_slots "
        "WHERE user_id = %s ORDER BY slot_number",
        (user_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    slots = [None, None, None]
    for row in rows:
        slots[row[1] - 1] = {
            "id": str(row[0]),
            "slot_number": row[1],
            "name": row[2],
            "day_count": row[3],
            "created_at": str(row[4]),
        }
    return {"slots": slots}


@router.post("", status_code=201)
def create_slot(req: CreateSlotRequest, authorization: str = Header()):
    user_id = _get_user_id(authorization)

    if req.slot_number < 1 or req.slot_number > 3:
        raise HTTPException(status_code=400, detail="Slot number must be 1, 2, or 3")

    name = req.name.strip() or "New Game"
    if len(name) > 100:
        raise HTTPException(status_code=400, detail="Name too long")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SET app.current_user_id = %s", (user_id,))

    # Check existing count
    cur.execute("SELECT COUNT(*) FROM game.save_slots WHERE user_id = %s", (user_id,))
    count = cur.fetchone()[0]
    if count >= 3:
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Maximum 3 save slots")

    # Check slot not taken
    cur.execute(
        "SELECT 1 FROM game.save_slots WHERE user_id = %s AND slot_number = %s",
        (user_id, req.slot_number),
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=409, detail="Slot already in use")

    # Create slot
    cur.execute(
        "INSERT INTO game.save_slots (user_id, slot_number, name) VALUES (%s, %s, %s) RETURNING id",
        (user_id, req.slot_number, name),
    )
    slot_id = cur.fetchone()[0]

    # Set save_slot_id for RLS on game tables
    cur.execute("SET app.current_save_slot_id = %s", (str(slot_id),))

    # Seed initial resources
    cur.execute(
        "INSERT INTO game.resources (save_slot_id, food, medicine, morale, population) "
        "VALUES (%s, 50, 20, 70, 5)",
        (str(slot_id),),
    )

    # Seed survivors (5 random activated + 10 inactive)
    seed_survivors(cur, str(slot_id))

    conn.commit()
    cur.close()
    conn.close()

    return {
        "id": str(slot_id),
        "slot_number": req.slot_number,
        "name": name,
        "day_count": 1,
    }


@router.delete("/{slot_id}", status_code=204)
def delete_slot(slot_id: str, authorization: str = Header()):
    user_id = _get_user_id(authorization)
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SET app.current_user_id = %s", (user_id,))

    # Verify ownership
    cur.execute(
        "SELECT 1 FROM game.save_slots WHERE id = %s AND user_id = %s",
        (slot_id, user_id),
    )
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Slot not found")

    # CASCADE handles all game data
    cur.execute("DELETE FROM game.save_slots WHERE id = %s", (slot_id,))
    conn.commit()
    cur.close()
    conn.close()


@router.get("/{slot_id}/survivors")
def list_survivors(slot_id: str, authorization: str = Header()):
    user_id = _get_user_id(authorization)
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SET app.current_user_id = %s", (user_id,))

    # Verify ownership
    cur.execute(
        "SELECT 1 FROM game.save_slots WHERE id = %s AND user_id = %s",
        (slot_id, user_id),
    )
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Slot not found")

    cur.execute("SET app.current_save_slot_id = %s", (slot_id,))
    cur.execute(
        """SELECT id, lore_id, name, background, background_detail, age,
                  persona, voice_notes, quirks,
                  str, dex, agi, per, endurance, int_stat, lck,
                  hp, max_hp, condition, camp_role, is_activated,
                  stat_growth, traits, skills, inventory, rations,
                  relationship_strength, morale_modifier, is_dead
           FROM game.survivors
           WHERE save_slot_id = %s
           ORDER BY is_dead ASC, is_activated DESC, name ASC""",
        (slot_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    survivors = []
    for r in rows:
        survivors.append({
            "id": str(r[0]),
            "lore_id": r[1],
            "name": r[2],
            "background": r[3],
            "background_detail": r[4],
            "age": r[5],
            "persona": r[6],
            "voice_notes": r[7],
            "quirks": r[8],
            "stats": {
                "str": r[9], "dex": r[10], "agi": r[11], "per": r[12],
                "end": r[13], "int": r[14], "lck": r[15],
            },
            "hp": r[16],
            "max_hp": r[17],
            "condition": r[18],
            "camp_role": r[19],
            "is_activated": r[20],
            "stat_growth": r[21],
            "traits": r[22],
            "skills": r[23],
            "inventory": r[24],
            "rations": r[25],
            "relationship_strength": r[26],
            "morale_modifier": r[27],
            "is_dead": r[28],
        })

    return {"survivors": survivors}


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@router.post("/{slot_id}/survivors/{survivor_id}/chat")
def chat_with_survivor(
    slot_id: str,
    survivor_id: str,
    req: ChatRequest,
    authorization: str = Header(),
):
    user_id = _get_user_id(authorization)
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SET app.current_user_id = %s", (user_id,))

    # Verify slot ownership
    cur.execute(
        "SELECT 1 FROM game.save_slots WHERE id = %s AND user_id = %s",
        (slot_id, user_id),
    )
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Slot not found")

    # Load survivor
    cur.execute("SET app.current_save_slot_id = %s", (slot_id,))
    cur.execute(
        """SELECT lore_id, name, background, persona, voice_notes, quirks,
                  condition, relationship_strength, is_activated, is_dead
           FROM game.survivors
           WHERE id = %s AND save_slot_id = %s""",
        (survivor_id, slot_id),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Survivor not found")

    survivor = {
        "lore_id": row[0],
        "name": row[1],
        "background": row[2],
        "persona": row[3],
        "voice_notes": row[4],
        "quirks": row[5],
        "condition": row[6],
        "relationship_strength": row[7],
        "is_activated": row[8],
        "is_dead": row[9],
    }

    if survivor["is_dead"]:
        return {"response": "..."}
    if not survivor["is_activated"]:
        raise HTTPException(status_code=400, detail="Survivor not yet encountered")

    response = get_survivor_response(survivor, req.message, req.history)
    return {"response": response}
