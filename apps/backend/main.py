from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.routers.passport import passport_router
from app.routers.inventory import inventory_router
from app.routers.dispense import dispense_router
from app.routers.prescriptions import prescription_router
from app.routers.patients import patient_router
from app.routers.ai import ai_router

BASE = Path(__file__).resolve().parent
TPL = BASE / "templates"

app = FastAPI(title="Business Financial Intelligence API")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

app.mount("/static", StaticFiles(directory=str(BASE / "static")), name="static")


def page(name: str) -> HTMLResponse:
    return HTMLResponse((TPL / name).read_text(encoding="utf-8"))


@app.get("/health")
def health():
    return {"ok": True}


# ---------- pages ----------
@app.get("/", include_in_schema=False)
def p_dashboard():
    return page("dashboard.html")

@app.get("/prescribe", include_in_schema=False)
def p_prescribe():
    return page("prescribe.html")

@app.get("/pharmacy", include_in_schema=False)
def p_pharmacy():
    return page("pharmacy.html")

@app.get("/activity", include_in_schema=False)
def p_activity():
    return page("activity.html")

@app.get("/transactions", include_in_schema=False)
def p_transactions():
    return page("transactions.html")

@app.get("/passport", include_in_schema=False)
def p_passport():
    return page("passport.html")

@app.get("/inventory", include_in_schema=False)
def p_inventory():
    return page("inventory.html")

@app.get("/scan", include_in_schema=False)
def p_scan():
    return page("scan.html")

@app.get("/voice", include_in_schema=False)
def p_voice():
    return page("voice.html")

@app.get("/wallet", include_in_schema=False)
def p_wallet():
    return page("wallet.html")

@app.get("/chat", include_in_schema=False)
def p_chat():
    return page("chat.html")


# ---------- api ----------
app.include_router(
    passport_router,
    prefix="/businesses",
    tags=["Passport"]
)
app.include_router(
    inventory_router,
    prefix="/businesses",
    tags=["Inventory"]
)
app.include_router(
    prescription_router,
    prefix="/prescriptions",
    tags=["Prescription"]
)
app.include_router(
    dispense_router,
    prefix="/dispense",
    tags=["Dispense"]
)

app.include_router(
    patient_router,
    tags=["Catalog"])


app.include_router(
    ai_router,
    prefix="/ai",
    tags=["AI"])


