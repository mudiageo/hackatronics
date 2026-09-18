from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import aliased
from sqlalchemy import case
from sqlmodel import Session, select, func

from app.db import get_session
from app.deps import require
from app.models.org import Organisation, User
from app.models.catalog import Patient
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


class TransactionIn(BaseModel):
    type: str = "income"
    description: str
    amount: int                       # kobo
    attestation_level: str = Attestation.SELF_REPORTED
    payment_reference: Optional[str] = None
    occurred_at: Optional[datetime] = None


@passport_router.get("/{org_id}/passport")
def get_passport(org_id: int,
                 session: Session = Depends(get_session),
                 role: str = Depends(require("passport"))):
    org = _get_org(session, org_id)
    data = passport(session, org_id)
    data["business"] = {"id": org.id, "name": org.name}
    return data


@passport_router.get("/{org_id}/verified-activity")
def verified_activity(org_id: int, limit: int = 20,
                      session: Session = Depends(get_session),
                      role: str = Depends(require("activity"))):
    """One join instead of four lookups per row — the N+1 pattern."""
    pharmacy = _get_org(session, org_id)

    Clinic = aliased(Organisation)
    Prescriber = aliased(User)
    Pharmacist = aliased(User)

    rows = session.exec(
        select(Dispense, Prescription, Clinic, Prescriber, Pharmacist)
        .join(Prescription, Prescription.id == Dispense.prescription_id)
        .join(Clinic, Clinic.id == Prescription.prescriber_org_id)
        .join(Prescriber, Prescriber.id == Prescription.prescriber_id)
        .join(Pharmacist, Pharmacist.id == Dispense.pharmacist_id)
        .where(Dispense.org_id == org_id)
        .order_by(Dispense.created_at.desc())
        .limit(limit)
    ).all()

    items = []
    for d, rx, clinic, prescriber, pharmacist in rows:
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
                 session: Session = Depends(get_session),
                 role: str = Depends(require("transactions_read"))):
    _get_org(session, org_id)

    Clinic = aliased(Organisation)

    rows = session.exec(
        select(Transaction, Patient, Clinic)
        .outerjoin(Dispense, Dispense.id == Transaction.dispense_id)
        .outerjoin(Prescription, Prescription.id == Dispense.prescription_id)
        .outerjoin(Patient, Patient.id == Dispense.patient_id)
        .outerjoin(Clinic, Clinic.id == Prescription.prescriber_org_id)
        .where(Transaction.org_id == org_id)
        .order_by(Transaction.occurred_at.desc())
        .limit(limit)
    ).all()

    CATEGORY = {
        "income": "Retail Sales",
        "sale": "Retail Sales",
        "expense": "Expense",
        "purchase": "Inventory",
    }
    INFLOW = {"income", "sale"}

    items = []
    for t, patient, clinic in rows:
        if patient:
            counterparty = patient.name
            via = clinic.name if clinic else None
        else:
            # manual entries store it as "Counter sale — Mrs Okafor"
            parts = t.description.split("—")
            counterparty = parts[1].strip() if len(parts) > 1 else "Walk-in customer"
            via = None

        items.append({
            "id": t.id,
            "reference": f"TX-{10000 + t.id}",
            "description": t.description.split("—")[0].strip(),
            "category": CATEGORY.get(t.type, t.type.title()),
            "counterparty": counterparty,
            "via_org": via,
            "amount": t.amount,
            "inflow": t.type in INFLOW,
            "type": t.type,
            "attestation_level": t.attestation_level,
            "occurred_at": t.occurred_at,
        })

    return {"items": items}


@passport_router.post("/{org_id}/transactions", status_code=201)
def create_transaction(org_id: int, payload: TransactionIn,
                       session: Session = Depends(get_session),
                       role: str = Depends(require("transactions_write"))):
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
    if payload.occurred_at:
        txn.occurred_at = payload.occurred_at

    session.add(txn)
    session.commit()
    session.refresh(txn)

    return {"id": txn.id, "description": txn.description,
            "amount": txn.amount, "type": txn.type,
            "attestation_level": txn.attestation_level,
            "occurred_at": txn.occurred_at}


@passport_router.get("/{org_id}/dashboard-metrics")
def dashboard_metrics(org_id: int,
                      session: Session = Depends(get_session),
                      role: str = Depends(require("dashboard"))):
    """Summed in SQL, not in Python — one row back instead of thousands."""
    _get_org(session, org_id)

    row = session.exec(
        select(
            func.coalesce(func.sum(
                case((Transaction.type.in_([TxnType.INCOME, TxnType.SALE]),
                      Transaction.amount), else_=0)), 0),
            func.coalesce(func.sum(
                case((Transaction.type.in_([TxnType.EXPENSE, TxnType.PURCHASE]),
                      Transaction.amount), else_=0)), 0),
        ).where(Transaction.org_id == org_id)
    ).one()

    revenue, expenses = row

    return {"revenue": revenue,
            "expenses": expenses,
            "profit": revenue - expenses,
            "cash_position": revenue - expenses,
            "coverage": coverage(session, org_id)}
