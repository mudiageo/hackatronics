from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db import get_session
from app.schemas.dispense import DispenseIn, DispenseOut, VerifyOut
from app.services.dispense import verify, dispense, DispenseError

dispense_router = APIRouter()

@dispense_router.get("/verify", response_model=VerifyOut)
def verify_code(code: str, patient_id: int, org_id: int,
                session: Session = Depends(get_session)):
    return verify(session, code, patient_id, org_id)

@dispense_router.post("", response_model=DispenseOut, status_code=201)
def do_dispense(payload: DispenseIn, session: Session = Depends(get_session)):
    try:
        return dispense(session, payload.code, payload.patient_id,
                        payload.org_id, payload.pharmacist_id)
    except DispenseError as e:
        raise HTTPException(status_code=409,
            detail={"error": {"code": e.code, "message": e.message}})
