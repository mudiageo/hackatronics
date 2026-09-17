from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.db import get_session
from app.models.org import Organisation, User
from app.models.dispense import Dispense
from app.models.prescription import Prescription
from app.models.ledger import Transaction
from app.models.base import TxnType, Attestation
from app.services.passport import passport, coverage

passport_router = APIRouter()


def _get_org(session: Session, org_id: int) -> Organisation:
    org = session.get(Organisation, org_id)
    if not org:
        raise HTTPException(404, detail={"error": {
            "code": "ORG_NOT_FOUND",
            "message": f"No business with id {org_id}"}})
    return org


@passport_router.get("/{org_id}/passport")
def get_passport(org_id: int, session: Session = Depends(get_session)):
    org = _get_org(session, org_id)
    data = passport(session, org_id)
    data["business"] = {"id": org.id, "name": org.name}
    return data


@passport_router.get("/{org_id}/verified-activity")
def verified_activity(org_id: int, limit: int = 20,
                      session: Session = Depends(get_session)):
    pharmacy = _get_org(session, org_id)
    rows = session.exec(select(Dispense)
        .where(Dispense.org_id == org_id)
        .order_by(Dispense.created_at.desc()).limit(limit)).all()

    items = []
    for d in rows:
        rx = session.get(Prescription, d.prescription_id)
        clinic = session.get(Organisation, rx.prescriber_org_id)
        prescriber = session.get(User, rx.prescriber_id)
        pharmacist = session.get(User, d.pharmacist_id)

        rx_at = rx.issued_at.isoformat()
        d_at = d.created_at.isoformat()

        items.append({
            "prescription_id": rx.id,
            "dispense_id": d.id,
            "from_org": clinic.name,
            "prescriber": prescriber.name,
            "to_org": pharmacy.name,
            "dispensed_at": d.created_at,
            "amount": d.total,
            "steps": [
                {"step": "prescribed", "timestamp": rx_at,
                 "actor": prescriber.name, "org": clinic.name},
                {"step": "verified", "timestamp": d_at,
                 "actor": pharmacist.name, "org": pharmacy.name},
                {"step": "dispensed", "timestamp": d_at,
                 "actor": pharmacist.name, "org": pharmacy.name},
                {"step": "stock_reduced", "timestamp": d_at,
                 "actor": None, "org": pharmacy.name},
                {"step": "settled", "timestamp": d_at,
                 "actor": None, "org": "Wema Bank"},
            ],
        })

    return {"items": items}


@passport_router.get("/{org_id}/transactions")
def transactions(org_id: int, limit: int = 50,
                 session: Session = Depends(get_session)):
    _get_org(session, org_id)
    rows = session.exec(select(Transaction)
        .where(Transaction.org_id == org_id)
        .order_by(Transaction.occurred_at.desc()).limit(limit)).all()
    return {"items": [{"id": t.id, "description": t.description,
                       "amount": t.amount, "type": t.type,
                       "attestation_level": t.attestation_level,
                       "occurred_at": t.occurred_at} for t in rows]}


class TransactionIn(BaseModel):
    type: str = "income"
    description: str
    amount: int                       # kobo
    attestation_level: str = Attestation.SELF_REPORTED
    payment_reference: Optional[str] = None


@passport_router.post("/{org_id}/transactions", status_code=201)
def create_transaction(org_id: int, payload: TransactionIn,
                       session: Session = Depends(get_session)):
    """Manual and AI-assisted entry. Can never claim ATTESTED —
    that tier is only produced by the dispensing flow."""
    _get_org(session, org_id)

    if payload.attestation_level == Attestation.ATTESTED:
        raise HTTPException(400, detail={"error": {
            "code": "CANNOT_CLAIM_ATTESTED",
            "message": "Attested records are produced by the dispensing flow, "
                       "not by manual entry"}})

    level = (Attestation.SETTLED if payload.payment_reference
             else Attestation.SELF_REPORTED)

    txn = Transaction(org_id=org_id, type=payload.type,
                      description=payload.description,
                      amount=payload.amount,
                      attestation_level=level)
    session.add(txn)
    session.commit()
    session.refresh(txn)

    return {"id": txn.id, "description": txn.description,
            "amount": txn.amount, "type": txn.type,
            "attestation_level": txn.attestation_level,
            "occurred_at": txn.occurred_at}


@passport_router.get("/{org_id}/dashboard-metrics")
def dashboard_metrics(org_id: int, session: Session = Depends(get_session)):
    _get_org(session, org_id)
    txns = session.exec(select(Transaction)
        .where(Transaction.org_id == org_id)).all()

    revenue = sum(t.amount for t in txns
                  if t.type in (TxnType.INCOME, TxnType.SALE))
    expenses = sum(t.amount for t in txns
                   if t.type in (TxnType.EXPENSE, TxnType.PURCHASE))

    return {"revenue": revenue,
            "expenses": expenses,
            "profit": revenue - expenses,
            "cash_position": revenue - expenses,
            "coverage": coverage(session, org_id)}
