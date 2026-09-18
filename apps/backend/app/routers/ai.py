import os, json, base64
import httpx
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlmodel import Session, select
from app.db import get_session
from app.models.catalog import Drug

ai_router = APIRouter()

KEY = os.environ.get("GEMINI_API_KEY")
URL = ("https://generativelanguage.googleapis.com/v1beta/models/"
       "gemini-2.0-flash:generateContent")

PROMPT = """Read this receipt or handwritten sales note from a Nigerian pharmacy.
Return ONLY raw JSON, no markdown fence, no explanation:
{"customer": string or null,
 "items": [{"name": string, "quantity": integer}],
 "amount_naira": number,
 "payment_method": string or null}
Use product names exactly as written on the note. Never invent database IDs."""


def _match_items(session: Session, raw_items: list) -> list:
    """Names are matched against real inventory here, not by the model."""
    drugs = session.exec(select(Drug)).all()
    out = []
    for it in raw_items:
        name = (it.get("name") or "").lower().strip()
        hits = [d for d in drugs
                if name and (name in d.name.lower() or d.name.lower() in name)]
        out.append({
            "read_as": it.get("name"),
            "quantity": it.get("quantity", 1),
            "matches": [{"id": d.id, "name": d.name, "strength": d.strength,
                         "unit_price": d.unit_price} for d in hits[:3]],
            "resolved": len(hits) == 1,
        })
    return out


@ai_router.post("/scan-transaction")
async def scan_transaction(file: UploadFile = File(...),
                           session: Session = Depends(get_session)):
    if not KEY:
        raise HTTPException(503, detail={"error": {
            "code": "AI_UNAVAILABLE", "message": "AI key not configured"}})

    blob = await file.read()
    if len(blob) > 6_000_000:
        raise HTTPException(413, detail={"error": {
            "code": "IMAGE_TOO_LARGE", "message": "Image must be under 6MB"}})

    body = {"contents": [{"parts": [
        {"text": PROMPT},
        {"inline_data": {"mime_type": file.content_type or "image/jpeg",
                         "data": base64.b64encode(blob).decode()}}]}]}

    try:
        async with httpx.AsyncClient(timeout=45) as c:
            r = await c.post(f"{URL}?key={KEY}", json=body)
    except httpx.TimeoutException:
        raise HTTPException(504, detail={"error": {
            "code": "AI_TIMEOUT", "message": "The AI took too long"}})

    if r.status_code != 200:
        raise HTTPException(502, detail={"error": {
            "code": "AI_FAILED", "message": r.text[:200]}})

    try:
        text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise HTTPException(502, detail={"error": {
            "code": "AI_EMPTY", "message": "No response from the model"}})

    text = (text.strip()
                .removeprefix("```json").removeprefix("```")
                .removesuffix("```").strip())
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(422, detail={"error": {
            "code": "AI_UNPARSEABLE",
            "message": "Couldn't read that image — try a clearer photo"}})

    items = _match_items(session, data.get("items") or [])
    amount = int(round(float(data.get("amount_naira") or 0) * 100))

    return {
        "customer": data.get("customer"),
        "items": items,
        "amount": amount,
        "payment_method": data.get("payment_method"),
        "attestation_level": "self_reported",
        "requires_confirmation": True,
        "note": "Read from an image supplied by the business. Not independently attested.",
    }
