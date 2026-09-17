from datetime import datetime, timezone
from enum import Enum

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

class Attestation(str, Enum):
    SELF_REPORTED = "self_reported"
    SETTLED = "settled"
    ATTESTED = "attested"

class CodeStatus(str, Enum):
    ACTIVE = "active"
    REDEEMED = "redeemed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class TxnType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    PURCHASE = "purchase"
    SALE = "sale"
