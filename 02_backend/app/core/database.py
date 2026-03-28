import psycopg2
from app.core.config import DATABASE_URL


def get_db():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL not configured")
    return psycopg2.connect(DATABASE_URL)
