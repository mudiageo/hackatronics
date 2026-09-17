from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
from app.models.base import utcnow

class Organisation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    kind: str                      # "clinic" | "pharmacy" | "bank"
    created_at: datetime = Field(default_factory=utcnow)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organisation.id", index=True)
    name: str
    role: str                      # prescriber | pharmacist | owner | bank
    pin_hash: Optional[str] = None
