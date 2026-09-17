from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models.catalog import Drug
from app.models.dispense import StockMovement
from app.services.inventory import stock_level

inventory_router = APIRouter()

@inventory_router.get("/{org_id}/inventory")
def inventory(org_id: int, session: Session = Depends(get_session)):
    drugs = session.exec(select(Drug)).all()
    out = []
    for d in drugs:
        qty = stock_level(session, org_id, d.id)
        out.append({"drug_id": d.id, "name": d.name, "strength": d.strength,
                    "quantity": qty, "unit_cost": d.unit_cost,
                    "unit_price": d.unit_price, "value": qty * d.unit_cost,
                    "low_stock": qty < 20})
    return {"items": out}

@inventory_router.post("/{org_id}/inventory/stock-in")
def stock_in(org_id: int, drug_id: int, quantity: int,
             session: Session = Depends(get_session)):
    session.add(StockMovement(org_id=org_id, drug_id=drug_id,
                              delta=quantity, reason="stock_in"))
    session.commit()
    return {"drug_id": drug_id, "quantity": stock_level(session, org_id, drug_id)}
