from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models.catalog import Patient, Drug

patient_router = APIRouter()

@patient_router.get("/patients/search")
def search_patients(q: str = "", limit: int = 10,
                    session: Session = Depends(get_session)):
    stmt = select(Patient)
    if q:
        stmt = stmt.where(Patient.name.ilike(f"%{q}%"))
    rows = session.exec(stmt.limit(limit)).all()
    return {"items": [{"id": p.id, "name": p.name, "phone": p.phone}
                      for p in rows]}

@patient_router.get("/drugs")
def list_drugs(session: Session = Depends(get_session)):
    rows = session.exec(select(Drug)).all()
    return {"items": [{"id": d.id, "name": d.name, "strength": d.strength,
                       "unit_price": d.unit_price} for d in rows]}
