from typing import List, Optional
from pydantic import BaseModel
from app.schemas.prescription import PrescriptionOut

class DispenseIn(BaseModel):
    code: str
    patient_id: int
    org_id: int
    pharmacist_id: int

class VerifyOut(BaseModel):
    valid: bool
    reason_code: Optional[str] = None
    message: Optional[str] = None
    prescription: Optional[PrescriptionOut] = None
    stock_ok: bool = True
    stock_warnings: List[str] = []

class StockChange(BaseModel):
    drug_name: str
    before: int
    after: int

class DispenseOut(BaseModel):
    dispense_id: int
    total: int
    payment_reference: str
    attestation_level: str
    stock_changes: List[StockChange]
    transaction_id: int
