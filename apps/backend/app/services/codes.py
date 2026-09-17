import secrets
from datetime import timedelta
from app.models.base import utcnow

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no O/0, I/1

def generate_code(length: int = 8) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))

def default_expiry(days: int = 7):
    return utcnow() + timedelta(days=days)
