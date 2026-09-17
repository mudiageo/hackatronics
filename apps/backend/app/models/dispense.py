from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
from app.models.base import utcnow

class Dispense(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(foreign_key="dispensingcode.code")
    prescription_id: int = Field(foreign_key="prescription.id")
    org_id: int = Field(foreign_key="organisation.id", index=True)
    pharmacist_id: int = Field(foreign_key="user.id")
    patient_id: int = Field(foreign_key="patient.id")
    total: int
    created_at: datetime = Field(default_factory=utcnow)

class DispenseItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    dispense_id: int = Field(foreign_key="dispense.id", index=True)
    drug_id: int = Field(foreign_key="drug.id")
    quantity: int
    unit_price: int

class StockMovement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organisation.id", index=True)
    drug_id: int = Field(foreign_key="drug.id", index=True)
    delta: int                     # +in, -out
    reason: str                    # stock_in | dispense | adjustment
    ref_id: Optional[int] = None
    created_at: datetime = Field(default_factory=utcnow)
