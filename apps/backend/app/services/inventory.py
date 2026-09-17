from sqlmodel import Session, select, func
from app.models.dispense import StockMovement

def stock_level(session: Session, org_id: int, drug_id: int) -> int:
    stmt = select(func.coalesce(func.sum(StockMovement.delta), 0)).where(
        StockMovement.org_id == org_id,
        StockMovement.drug_id == drug_id,
    )
    return session.exec(stmt).one()
