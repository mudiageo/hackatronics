import statistics
from collections import defaultdict
from sqlmodel import Session, select, func
from app.models.ledger import Transaction, Payment
from app.models.base import Attestation, TxnType
from app.models.dispense import Dispense

def _month(dt): return dt.strftime("%Y-%m")

def coverage(session: Session, org_id: int) -> dict:
    txns = session.exec(select(Transaction).where(
        Transaction.org_id == org_id,
        Transaction.type.in_([TxnType.INCOME, TxnType.SALE]))).all()
    recorded = sum(t.amount for t in txns)
    settled = sum(t.amount for t in txns if t.attestation_level in
                  (Attestation.SETTLED, Attestation.ATTESTED))
    attested = sum(t.amount for t in txns if t.attestation_level == Attestation.ATTESTED)
    pct = lambda a, b: round(a / b * 100) if b else 0
    return {"recorded": recorded, "settled": settled, "attested": attested,
            "settled_pct": pct(settled, recorded),
            "attested_pct": pct(attested, recorded)}

def passport(session: Session, org_id: int) -> dict:
    txns = session.exec(select(Transaction).where(
        Transaction.org_id == org_id,
        Transaction.attestation_level == Attestation.ATTESTED)).all()

    by_month = defaultdict(int)
    for t in txns:
        by_month[_month(t.occurred_at)] += t.amount
    monthly = list(by_month.values())

    median_rev = int(statistics.median(monthly)) if monthly else 0
    if len(monthly) > 1 and statistics.mean(monthly):
        cv = statistics.pstdev(monthly) / statistics.mean(monthly)
        consistency = max(0, min(100, round((1 - cv) * 100)))
    else:
        consistency = 0

    disp = session.exec(select(Dispense).where(Dispense.org_id == org_id)).all()
    patients = len({d.patient_id for d in disp})

    metrics = [
        {"key": "monthly_revenue", "label": "Verified monthly revenue",
         "value": median_rev, "unit": "kobo", "drillable": True},
        {"key": "consistency", "label": "Revenue consistency",
         "value": consistency, "unit": "score", "drillable": True},
        {"key": "unique_patients", "label": "Unique patients served",
         "value": patients, "unit": "count", "drillable": True},
        {"key": "months_history", "label": "Months of verified history",
         "value": len(monthly), "unit": "count", "drillable": False},
    ]

    weights = {"consistency": 0.4, "coverage": 0.4, "history": 0.2}
    cov = coverage(session, org_id)
    history_score = min(100, len(monthly) * 16)
    readiness = round(consistency * weights["consistency"]
                      + cov["attested_pct"] * weights["coverage"]
                      + history_score * weights["history"])

    return {"coverage": cov, "metrics": metrics,
            "readiness": {"score": readiness, "weights": weights},
            "credit_limit": median_rev * 2,
            "flags": flags(session, org_id)}

def flags(session: Session, org_id: int) -> list:
    """Ledger revenue must reconcile against settled payments."""
    ledger = session.exec(select(func.coalesce(func.sum(Transaction.amount), 0))
        .where(Transaction.org_id == org_id,
               Transaction.attestation_level == Attestation.ATTESTED)).one()
    paid = session.exec(select(func.coalesce(func.sum(Payment.amount), 0))
        .where(Payment.org_id == org_id)).one()
    if ledger != paid:
        return [{"type": "RECONCILIATION_GAP", "severity": "high",
                 "detail": f"Attested revenue {ledger} vs settled {paid}"}]
    return []
