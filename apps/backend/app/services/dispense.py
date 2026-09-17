from datetime import timezone
from sqlmodel import Session, select
from app.models.base import utcnow, CodeStatus, Attestation, TxnType
from app.models.prescription import Prescription, PrescriptionItem, DispensingCode
from app.models.dispense import Dispense, DispenseItem, StockMovement
from app.models.ledger import Payment, Transaction, AuditLog
from app.models.catalog import Drug
from app.services.inventory import stock_level
from app.models.org import User, Organisation
from app.models.catalog import Patient

class DispenseError(Exception):
    def __init__(self, code: str, message: str):
        self.code, self.message = code, message
        super().__init__(message)

def _aware(dt):
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

def _audit(session, action, target, outcome, detail=None, org_id=None):
    session.add(AuditLog(action=action, target=target, outcome=outcome,
                         detail=detail, org_id=org_id))

def load_and_validate(session: Session, code: str, patient_id: int):
    dc = session.get(DispensingCode, code)
    if not dc:
        raise DispenseError("CODE_NOT_FOUND", "No prescription found for that code")
    if dc.status == CodeStatus.REDEEMED:
        raise DispenseError("CODE_ALREADY_REDEEMED",
                            f"Redeemed on {dc.redeemed_at:%d %b at %H:%M}")
    if dc.status != CodeStatus.ACTIVE:
        raise DispenseError("CODE_INACTIVE", f"Code is {dc.status}")
    if _aware(dc.expires_at) < utcnow():
        raise DispenseError("CODE_EXPIRED", "This code has expired")

    rx = session.get(Prescription, dc.prescription_id)
    if rx.patient_id != patient_id:
        raise DispenseError("PATIENT_MISMATCH",
                            "This code belongs to a different patient")

    items = session.exec(select(PrescriptionItem).where(
        PrescriptionItem.prescription_id == rx.id)).all()
    return dc, rx, items

def dispense(session: Session, code: str, patient_id: int,
             org_id: int, pharmacist_id: int) -> dict:
    try:
        dc, rx, items = load_and_validate(session, code, patient_id)
    except DispenseError as e:
        _audit(session, "dispense", f"code:{code}", "denied", e.code, org_id)
        session.commit()
        raise

    # stock check before writing anything
    changes = []
    for it in items:
        before = stock_level(session, org_id, it.drug_id)
        if before < it.quantity:
            drug = session.get(Drug, it.drug_id)
            _audit(session, "dispense", f"code:{code}", "denied",
                   "INSUFFICIENT_STOCK", org_id)
            session.commit()
            raise DispenseError(
                "INSUFFICIENT_STOCK",
                f"{drug.name}: need {it.quantity}, have {before}")
        changes.append((it, before))

    total = sum(it.quantity * it.unit_price for it in items)

    d = Dispense(code=code, prescription_id=rx.id, org_id=org_id,
                 pharmacist_id=pharmacist_id, patient_id=patient_id, total=total)
    session.add(d)
    session.flush()                     # need d.id

    stock_changes = []
    for it, before in changes:
        session.add(DispenseItem(dispense_id=d.id, drug_id=it.drug_id,
                                 quantity=it.quantity, unit_price=it.unit_price))
        session.add(StockMovement(org_id=org_id, drug_id=it.drug_id,
                                  delta=-it.quantity, reason="dispense", ref_id=d.id))
        drug = session.get(Drug, it.drug_id)
        stock_changes.append({"drug_name": drug.name, "before": before,
                              "after": before - it.quantity})

    from app.services.wema_rail import collect
    pay_ref = collect(amount=total, org_id=org_id, reference_hint=f"dsp_{d.id}")
    payment = Payment(org_id=org_id, amount=total, reference=pay_ref)
    session.add(payment)
    session.flush()

    txn = Transaction(org_id=org_id, type=TxnType.INCOME,
                      description=f"Dispensed prescription #{rx.id}",
                      amount=total,
                      attestation_level=Attestation.ATTESTED,
                      dispense_id=d.id, payment_id=payment.id)
    session.add(txn)

    dc.status = CodeStatus.REDEEMED
    dc.redeemed_at = utcnow()
    rx.status = "dispensed"
    session.add_all([dc, rx])

    _audit(session, "dispense", f"code:{code}", "success", None, org_id)
    session.commit()

    return {"dispense_id": d.id, "total": total,
            "payment_reference": pay_ref,
            "attestation_level": Attestation.ATTESTED,
            "stock_changes": stock_changes, "transaction_id": txn.id}

def verify(session: Session, code: str, patient_id: int, org_id: int) -> dict:
    try:
        dc, rx, items = load_and_validate(session, code, patient_id)
    except DispenseError as e:
        return {"valid": False, "reason_code": e.code, "message": e.message}

    warnings, ok = [], True
    out_items, total = [], 0
    for it in items:
        drug = session.get(Drug, it.drug_id)
        have = stock_level(session, org_id, it.drug_id)
        if have < it.quantity:
            ok = False
            warnings.append(f"{drug.name}: need {it.quantity}, have {have}")
        line = it.quantity * it.unit_price
        total += line
        out_items.append({"drug_name": drug.name, "dose": it.dose,
                          "frequency_per_day": it.frequency_per_day,
                          "days": it.days, "quantity": it.quantity,
                          "unit_price": it.unit_price, "line_total": line})

    prescriber = session.get(User, rx.prescriber_id)
    org = session.get(Organisation, rx.prescriber_org_id)
    patient = session.get(Patient, rx.patient_id)
    return {"valid": True, "stock_ok": ok, "stock_warnings": warnings,
            "prescription": {"id": rx.id, "code": code,
                             "expires_at": dc.expires_at,
                             "prescriber": {"name": prescriber.name, "org": org.name},
                             "patient": {"id": patient.id, "name": patient.name},
                             "items": out_items, "total": total}}
