from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class ItemIn(BaseModel):
    drug_id: int
    dose: str
    frequency_per_day: int
    days: int

class PrescriptionIn(BaseModel):
    patient_id: int
    prescriber_id: int
    items: List[ItemIn]

class ItemOut(BaseModel):
    drug_name: str
    dose: str
    frequency_per_day: int
    days: int
    quantity: int
    unit_price: int
    line_total: int

class PrescriptionOut(BaseModel):
    id: int
    code: str
    expires_at: datetime
    prescriber: dict
    patient: dict
    items: List[ItemOut]
    total: int
