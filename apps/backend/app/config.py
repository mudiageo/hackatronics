from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./dev.db"
    CODE_TTL_DAYS: int = 7
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = BASE_DIR / ".env"
        extra = "ignore"

settings = Settings()
