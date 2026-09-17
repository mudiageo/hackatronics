from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.passport import passport_router

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