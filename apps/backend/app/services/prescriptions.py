from sqlmodel import Session, select
from fastapi import HTTPException
from app.models.prescription import Prescription, PrescriptionItem, DispensingCode
from app.models.catalog import Drug, Patient
from app.models.org import User, Organisation
from app.services.codes import generate_code, default_expiry
from app.config import settings


def create_prescription(session, patient_id, prescriber_id, items):
    prescriber = session.get(User, prescriber_id)
    if not prescriber:
        raise HTTPException(404, detail={"error": {
            "code": "PRESCRIBER_NOT_FOUND",
            "message": f"No user with id {prescriber_id}"}})

    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(404, detail={"error": {
            "code": "PATIENT_NOT_FOUND",
            "message": f"No patient with id {patient_id}"}})

    expires = default_expiry(settings.CODE_TTL_DAYS)

    rx = Prescription(patient_id=patient_id,
                      prescriber_id=prescriber_id,
                      prescriber_org_id=prescriber.org_id,
                      expires_at=expires)
    session.add(rx)
    session.flush()

    out_items, total = [], 0
    for it in items:
        drug = session.get(Drug, it.drug_id)
        if not drug:
            raise HTTPException(404, detail={"error": {
                "code": "DRUG_NOT_FOUND",
                "message": f"No drug with id {it.drug_id}"}})

        qty = it.frequency_per_day * it.days
        line = qty * drug.unit_price
        total += line

        session.add(PrescriptionItem(
            prescription_id=rx.id, drug_id=drug.id, dose=it.dose,
            frequency_per_day=it.frequency_per_day, days=it.days,
            quantity=qty, unit_price=drug.unit_price))

        out_items.append({"drug_name": drug.name, "dose": it.dose,
                          "frequency_per_day": it.frequency_per_day,
                          "days": it.days, "quantity": qty,
                          "unit_price": drug.unit_price, "line_total": line})

    code = generate_code()
    while session.get(DispensingCode, code):
        code = generate_code()
    session.add(DispensingCode(code=code, prescription_id=rx.id,
                               expires_at=expires))
    session.commit()

    org = session.get(Organisation, prescriber.org_id)
    return {"id": rx.id, "code": code, "expires_at": expires,
            "prescriber": {"name": prescriber.name, "org": org.name},
            "patient": {"id": patient.id, "name": patient.name},
            "items": out_items, "total": total}