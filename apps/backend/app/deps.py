from fastapi import Header, HTTPException
from typing import Optional

# what each role may call. Anything not listed is denied.
PERMS = {
    "clinic":   {"prescribe", "catalog"},
    "pharmacy": {"dispense", "inventory", "inventory_write",
                 "transactions_read", "catalog"},
    "owner":    {"dashboard", "transactions_read", "transactions_write",
                 "inventory", "inventory_write", "activity",
                 "passport", "catalog", "ai"},
    "bank":     {"passport", "activity", "dashboard"},
}

DENY = {
    "bank":     "A lender sees the passport and its evidence trail — "
                "not the business's raw books, stock or patients.",
    "clinic":   "A prescriber issues prescriptions. The pharmacy's finances "
                "are a different organisation's data.",
    "pharmacy": "The counter can dispense and manage stock. Financing views "
                "belong to the owner.",
    "owner":    "Not permitted for this role.",
}


def role_from(x_role: Optional[str]) -> str:
    r = (x_role or "owner").lower()
    return r if r in PERMS else "owner"


def require(permission: str):
    """Usage:  def endpoint(..., role: str = Depends(require("passport")))"""
    def check(x_role: Optional[str] = Header(default=None)) -> str:
        role = role_from(x_role)
        if permission not in PERMS[role]:
            raise HTTPException(403, detail={"error": {
                "code": "FORBIDDEN_FOR_ROLE",
                "message": f"{role.title()} cannot access this. " + DENY[role],
            }})
        return role
    return check
