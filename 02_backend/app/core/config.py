import os


DATABASE_URL = os.environ.get("DATABASE_URL", "")
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
