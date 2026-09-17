from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models.org import Organisation
from app.models.dispense import Dispense
from app.models.prescription import Prescription
from app.models.org import User
from app.services.passport import passport

passport_router = APIRouter()

@passport_router.get("/{org_id}/passport")
def get_passport(org_id: int, session: Session = Depends(get_session)):
    org = session.get(Organisation, org_id)
    data = passport(session, org_id)
    data["business"] = {"id": org.id, "name": org.name}
    return data

@passport_router.get("/{org_id}/verified-activity")
def verified_activity(org_id: int, limit: int = 20,
                      session: Session = Depends(get_session)):
    rows = session.exec(select(Dispense).where(Dispense.org_id == org_id)
                        .order_by(Dispense.created_at.desc()).limit(limit)).all()
    pharmacy = session.get(Organisation, org_id)
    items = []
    for d in rows:
        rx = session.get(Prescription, d.prescription_id)
        clinic = session.get(Organisation, rx.prescriber_org_id)
        prescriber = session.get(User, rx.prescriber_id)
        items.append({
            "prescription_id": rx.id, "dispense_id": d.id,
            "from_org": clinic.name, "prescriber": prescriber.name,
            "to_org": pharmacy.name, "dispensed_at": d.created_at,
            "amount": d.total,
            "steps": ["prescribed", "verified", "dispensed",
                      "stock_reduced", "settled"]})
    return {"items": items}

@passport_router.get("/{org_id}/transactions")
def transactions(org_id: int, limit: int = 50,
                 session: Session = Depends(get_session)):
    from app.models.ledger import Transaction
    rows = session.exec(select(Transaction)
        .where(Transaction.org_id == org_id)
        .order_by(Transaction.occurred_at.desc()).limit(limit)).all()
    return {"items": [{"id": t.id, "description": t.description,
                       "amount": t.amount, "type": t.type,
                       "attestation_level": t.attestation_level,
                       "occurred_at": t.occurred_at} for t in rows]}
