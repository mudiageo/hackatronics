from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db import get_session
from app.schemas.prescription import PrescriptionIn, PrescriptionOut
from app.services.prescriptions import create_prescription

prescription_router = APIRouter()

@prescription_router.post("", response_model=PrescriptionOut, status_code=201)
def create(payload: PrescriptionIn, session: Session = Depends(get_session)):
    return create_prescription(session, payload.patient_id,
                               payload.prescriber_id, payload.items)
