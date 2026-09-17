from typing import Optional
from sqlmodel import SQLModel, Field

class Patient(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: Optional[str] = None

class Drug(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    strength: Optional[str] = None
    unit_cost: int = 0             # kobo
    unit_price: int = 0            # kobo
