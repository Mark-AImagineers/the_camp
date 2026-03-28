import re
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_tag,
)

router = APIRouter()

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


def _user_response(row: dict) -> dict:
    return {
        "id": str(row["id"]),
        "email": row["email"],
        "display_name": row["display_name"],
        "tag": row["tag"],
        "handle": f"{row['display_name']}#{row['tag']}",
        "is_approved": row["is_approved"],
        "created_at": str(row["created_at"]),
    }


def _fetch_user_by_email(email: str) -> dict | None:
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email, password_hash, display_name, tag, is_active, is_approved, created_at "
        "FROM auth.users WHERE email = %s",
        (email.lower().strip(),),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None
    return {
        "id": row[0], "email": row[1], "password_hash": row[2],
        "display_name": row[3], "tag": row[4], "is_active": row[5],
        "is_approved": row[6], "created_at": row[7],
    }


def _fetch_user_by_id(user_id: str) -> dict | None:
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email, password_hash, display_name, tag, is_active, is_approved, created_at "
        "FROM auth.users WHERE id = %s",
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None
    return {
        "id": row[0], "email": row[1], "password_hash": row[2],
        "display_name": row[3], "tag": row[4], "is_active": row[5],
        "is_approved": row[6], "created_at": row[7],
    }


@router.post("/register", status_code=201)
def register(req: RegisterRequest):
    if not EMAIL_RE.match(req.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not req.display_name.strip():
        raise HTTPException(status_code=400, detail="Display name is required")
    if len(req.display_name.strip()) > 100:
        raise HTTPException(status_code=400, detail="Display name too long")

    email = req.email.lower().strip()
    display_name = req.display_name.strip()

    existing = _fetch_user_by_email(email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    tag = generate_tag()
    password_hash = hash_password(req.password)

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO auth.users (email, password_hash, display_name, tag, is_approved) "
        "VALUES (%s, %s, %s, %s, FALSE)",
        (email, password_hash, display_name, tag),
    )
    conn.commit()
    cur.close()
    conn.close()

    handle = f"{display_name}#{tag}"
    return {"handle": handle, "message": "Registration complete. Pending approval."}


@router.post("/login")
def login(req: LoginRequest):
    user = _fetch_user_by_email(req.email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account suspended.")

    if not user["is_approved"]:
        raise HTTPException(status_code=403, detail="Your account is pending approval.")

    user_id = str(user["id"])
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
        "user": _user_response(user),
    }


@router.post("/refresh")
def refresh(req: RefreshRequest):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = _fetch_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account suspended.")
    if not user["is_approved"]:
        raise HTTPException(status_code=403, detail="Your account is pending approval.")

    user_id = str(user["id"])
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
    }


@router.get("/me")
def me(authorization: str = Header()):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization[7:]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = _fetch_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return _user_response(user)
