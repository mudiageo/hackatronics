from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.passport import passport_router
from app.routers.inventory import inventory_router
from app.routers.dispense import dispense_router
from app.routers.prescriptions import prescription_router
from app.routers.patients import patient_router
from app.routers.ai import ai_router


app = FastAPI(title="Business Financial Intelligence API")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health():
    return {"ok": True}

app.include_router(
    passport_router, 
    prefix="/passport",
    tags=["Passport"]
)
app.include_router(
    inventory_router, 
    prefix="/inventory",
    tags=["Inventory"]
)
app.include_router(
    prescription_router, 
    prefix="/prescription",
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
