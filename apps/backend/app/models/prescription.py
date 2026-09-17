from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
from app.models.base import utcnow, CodeStatus

class Prescription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True)
    prescriber_id: int = Field(foreign_key="user.id")
    prescriber_org_id: int = Field(foreign_key="organisation.id")
    issued_at: datetime = Field(default_factory=utcnow)
    expires_at: datetime
    status: str = "issued"

class PrescriptionItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    prescription_id: int = Field(foreign_key="prescription.id", index=True)
    drug_id: int = Field(foreign_key="drug.id")
    dose: str
    frequency_per_day: int
    days: int
    quantity: int                  # frequency_per_day * days
    unit_price: int

class DispensingCode(SQLModel, table=True):
    code: str = Field(primary_key=True)
    prescription_id: int = Field(foreign_key="prescription.id", index=True)
    status: str = CodeStatus.ACTIVE
    expires_at: datetime
    redeemed_at: Optional[datetime] = None
