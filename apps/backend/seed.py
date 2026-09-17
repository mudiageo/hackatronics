"""Seeds orgs, users, patients, drugs, stock — plus 6 months of
dispensing history through the real endpoints, so every ledger row
is produced the same way a live one would be."""

import random
from datetime import timedelta
from sqlmodel import Session, select, delete
from app.db import engine
from app.models.base import utcnow
from app.models.org import Organisation, User
from app.models.catalog import Patient, Drug
from app.models.dispense import StockMovement, Dispense, DispenseItem
from app.models.prescription import Prescription, PrescriptionItem, DispensingCode
from app.models.ledger import Payment, Transaction, AuditLog
from app.services.prescriptions import create_prescription
from app.services.dispense import dispense
from app.schemas.prescription import ItemIn

FIRST = ["Chidi","Amaka","Tunde","Ngozi","Emeka","Fatima","Segun","Blessing",
         "Ifeanyi","Halima","Yemi","Chioma","Musa","Adaeze","Kunle","Zainab"]
LAST = ["Okafor","Adeyemi","Balogun","Eze","Obi","Bello","Nwosu","Lawal"]

DRUGS = [
    ("Amoxicillin", "500mg", 12000, 15000),
    ("Paracetamol", "500mg", 2000, 3500),
    ("Artemether-Lumefantrine", "20/120mg", 45000, 58000),
    ("Metformin", "500mg", 8000, 11000),
    ("Amlodipine", "5mg", 9000, 13000),
    ("Ciprofloxacin", "500mg", 18000, 24000),
    ("Omeprazole", "20mg", 14000, 19000),
    ("Ibuprofen", "400mg", 3000, 5000),
]

def wipe(session):
    for model in (AuditLog, Transaction, Payment, DispenseItem, Dispense,
                  StockMovement, DispensingCode, PrescriptionItem,
                  Prescription, Patient, Drug, User, Organisation):
        session.exec(delete(model))
    session.commit()

def run():
    with Session(engine, expire_on_commit=False) as s:
        wipe(s)

        clinic = Organisation(name="Grace Medical Centre", kind="clinic")
        pharmacy = Organisation(name="Wellcare Pharmacy, Ikeja", kind="pharmacy")
        bank = Organisation(name="Wema Bank", kind="bank")
        s.add_all([clinic, pharmacy, bank]); s.flush()

        prescribers = [
            User(org_id=clinic.id, name="Dr Maximum Alex", role="prescriber"),
            User(org_id=clinic.id, name="Dr Amina Yusuf", role="prescriber"),
        ]
        pharmacist = User(org_id=pharmacy.id, name="Pharm. Tobi Ade", role="pharmacist")
        owner = User(org_id=pharmacy.id, name="Mrs Grace Eze", role="owner")
        analyst = User(org_id=bank.id, name="Wema Credit Desk", role="bank")
        s.add_all(prescribers + [pharmacist, owner, analyst]); s.flush()

        patients = [Patient(name=f"{random.choice(FIRST)} {random.choice(LAST)}",
                            phone=f"080{random.randint(10000000, 99999999)}")
                    for _ in range(60)]
        s.add_all(patients); s.flush()

        drugs = [Drug(name=n, strength=st, unit_cost=c, unit_price=p)
                 for n, st, c, p in DRUGS]
        s.add_all(drugs); s.flush()

        # plain ints — nothing can lazy-load mid-loop
        clinic_id, pharmacy_id, bank_id = clinic.id, pharmacy.id, bank.id
        pharmacist_id = pharmacist.id
        drug_ids = [d.id for d in drugs]
        patient_ids = [p.id for p in patients]
        prescriber_ids = [p.id for p in prescribers]

        for did in drug_ids:
            s.add(StockMovement(org_id=pharmacy_id, drug_id=did,
                                delta=4000, reason="stock_in"))
        s.commit()

        start = utcnow() - timedelta(days=180)
        made = 0
        for day in range(90):
            when = start + timedelta(days=day)
            for _ in range(random.randint(6, 14)):
                pid = random.choice(patient_ids)
                items = [ItemIn(drug_id=random.choice(drug_ids),
                                dose="1 tab",
                                frequency_per_day=random.choice([2, 3]),
                                days=random.choice([3, 5, 7]))
                         for _ in range(random.randint(1, 3))]

                rx = create_prescription(s, pid, random.choice(prescriber_ids), items)
                _backdate(s, rx["id"], rx["code"], when)

                if random.random() < 0.88:          # 12% never redeemed
                    try:
                        out = dispense(s, rx["code"], pid,
                                       pharmacy_id, pharmacist_id)
                        _backdate_dispense(s, out["dispense_id"],
                                           out["transaction_id"], when)
                        made += 1
                    except Exception as e:
                        print("skip:", e)

            if day % 30 == 0:                       # monthly restock
                for did in drug_ids:
                    s.add(StockMovement(org_id=pharmacy_id, drug_id=did,
                                        delta=1500, reason="stock_in",
                                        created_at=when))
                s.commit()

            if day % 30 == 0:
                print(f"  day {day}/180 — {made} dispensed")

        print(f"seeded {made} dispenses  clinic={clinic_id} "
              f"pharmacy={pharmacy_id} bank={bank_id} "
              f"prescriber={prescriber_ids[0]} pharmacist={pharmacist_id}")

def _backdate(s, rx_id, code, when):
    rx = s.get(Prescription, rx_id)
    rx.issued_at = when
    rx.expires_at = utcnow() + timedelta(days=365)
    dc = s.get(DispensingCode, code)
    dc.expires_at = utcnow() + timedelta(days=365)
    s.add_all([rx, dc]); s.commit()


def _backdate_dispense(s, dispense_id, txn_id, when):
    d = s.get(Dispense, dispense_id)
    d.created_at = when
    t = s.get(Transaction, txn_id)
    t.occurred_at = when
    dc = s.exec(select(DispensingCode).where(
        DispensingCode.prescription_id == d.prescription_id)).first()
    dc.redeemed_at = when
    dc.expires_at = when + timedelta(days=7)
    for m in s.exec(select(StockMovement).where(
            StockMovement.ref_id == dispense_id)).all():
        m.created_at = when
        s.add(m)
    s.add_all([d, t, dc]); s.commit()

if __name__ == "__main__":
    run()