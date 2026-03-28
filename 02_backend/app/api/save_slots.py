from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import decode_token

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

    # Seed initial resources
    cur.execute(
        "INSERT INTO game.resources (save_slot_id, food, medicine, morale, population) "
        "VALUES (%s, 50, 20, 70, 5)",
        (str(slot_id),),
    )

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
