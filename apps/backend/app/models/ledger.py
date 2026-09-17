from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
from app.models.base import utcnow, Attestation, TxnType

class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organisation.id", index=True)
    amount: int
    reference: str
    provider: str = "wema_mock"
    created_at: datetime = Field(default_factory=utcnow)

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organisation.id", index=True)
    type: str = TxnType.INCOME
    description: str
    amount: int
    attestation_level: str = Attestation.SELF_REPORTED
    dispense_id: Optional[int] = Field(default=None, foreign_key="dispense.id")
    payment_id: Optional[int] = Field(default=None, foreign_key="payment.id")
    occurred_at: datetime = Field(default_factory=utcnow)

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    actor_id: Optional[int] = None
    org_id: Optional[int] = None
    action: str
    target: str
    outcome: str                   # success | denied
    detail: Optional[str] = None
    at: datetime = Field(default_factory=utcnow)
