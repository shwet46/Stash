"""Billing API endpoints — GST invoices, PDF generation, and Telegram share"""
import io
import csv
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from app.services.firestore_service import firestore_service
from app.services.billing_pdf import generate_invoice_pdf
from app.core.config import settings
from typing import Optional
import httpx

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.get("")
async def list_bills(status: Optional[str] = Query(None)):
    """List all bills"""
    if not firestore_service.is_enabled:
        return []

    collection = firestore_service.db.collection("bills")
    query = collection

    if status:
        query = query.where("status", "==", status)

    docs = query.stream()
    bills = []
    async for doc in docs:
        b = doc.to_dict()
        b["id"] = doc.id
        # convert decimal/numbers
        for k in ["amount", "gst_rate", "gst_amount", "total", "unit_price"]:
            if k in b and b[k] is not None:
                b[k] = float(b[k])
        bills.append(b)

    # Sort by created_at desc (in python)
    bills.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    return bills


@router.get("/{bill_ref}")
async def get_bill(bill_ref: str):
    """Get a single bill by bill_ref"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=503, detail="Firestore disabled")

    docs = firestore_service.db.collection("bills").where("bill_ref", "==", bill_ref).limit(1).stream()
    bill = None
    async for doc in docs:
        bill = doc.to_dict()
        bill["id"] = doc.id
        break

    if not bill:
        raise HTTPException(status_code=404, detail=f"Bill {bill_ref} not found")

    for k in ["amount", "gst_rate", "gst_amount", "total", "unit_price"]:
        if k in bill and bill[k] is not None:
            bill[k] = float(bill[k])

    return bill


@router.get("/{bill_ref}/pdf")
async def download_bill_pdf(bill_ref: str):
    """Stream the invoice PDF for a given bill_ref"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=503, detail="Firestore disabled")

    # Fetch bill data
    docs = firestore_service.db.collection("bills").where("bill_ref", "==", bill_ref).limit(1).stream()
    bill = None
    async for doc in docs:
        bill = doc.to_dict()
        break

    if not bill:
        raise HTTPException(status_code=404, detail=f"Bill {bill_ref} not found")

    for k in ["amount", "gst_rate", "gst_amount", "total", "unit_price"]:
        if k in bill and bill[k] is not None:
            bill[k] = float(bill[k])

    pdf_bytes = await generate_invoice_pdf(bill)

    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="PDF generation failed — WeasyPrint unavailable")

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{bill_ref}.pdf"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )


@router.post("/{bill_ref}/telegram")
async def share_bill_telegram(bill_ref: str, data: dict = {}):
    """Send invoice PDF to a Telegram chat (admin channel or buyer chat)"""
    if not settings.TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=503, detail="Telegram bot not configured")

    if not firestore_service.is_enabled:
        raise HTTPException(status_code=503, detail="Firestore disabled")

    # Fetch bill data
    docs = firestore_service.db.collection("bills").where("bill_ref", "==", bill_ref).limit(1).stream()
    bill = None
    async for doc in docs:
        bill = doc.to_dict()
        break

    if not bill:
        raise HTTPException(status_code=404, detail=f"Bill {bill_ref} not found")

    for k in ["amount", "gst_rate", "gst_amount", "total", "unit_price"]:
        if k in bill and bill[k] is not None:
            bill[k] = float(bill[k])

    # Generate PDF
    pdf_bytes = await generate_invoice_pdf(bill)
    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="PDF generation failed")

    # Determine target chat_id
    chat_id = data.get("chat_id") or settings.TELEGRAM_CHAT_ID if hasattr(settings, "TELEGRAM_CHAT_ID") else None
    if not chat_id:
        raise HTTPException(status_code=400, detail="No chat_id provided and no default admin chat configured")

    caption = (
        f"🧾 <b>Invoice {bill_ref}</b>\n\n"
        f"Buyer: {bill.get('buyer_name', 'N/A')}\n"
        f"Order: {bill.get('order_ref', 'N/A')}\n"
        f"Amount: ₹{bill.get('amount', 0):,.2f}\n"
        f"GST ({bill.get('gst_rate', 0)}%): ₹{bill.get('gst_amount', 0):,.2f}\n"
        f"<b>Total: ₹{bill.get('total', 0):,.2f}</b>\n\n"
        f"Powered by Stash AI Supply Chain"
    )

    TELEGRAM_API = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TELEGRAM_API}/sendDocument",
            data={"chat_id": chat_id, "caption": caption, "parse_mode": "HTML"},
            files={"document": (f"{bill_ref}.pdf", pdf_bytes, "application/pdf")},
        )

    result = response.json()
    if not result.get("ok"):
        raise HTTPException(status_code=502, detail=f"Telegram API error: {result.get('description', 'Unknown error')}")

    return {"status": "sent", "bill_ref": bill_ref, "chat_id": chat_id}


@router.post("/generate/{order_id}")
async def generate_bill(order_id: str):
    """Generate invoice PDF for an order (legacy endpoint)"""
    if not firestore_service.is_enabled:
        # Fallback demo data
        bill_data = {
            "bill_ref": f"INV-{order_id[:4]}",
            "buyer_name": "Demo Buyer",
            "buyer_phone": "+91 98765 43210",
            "order_ref": order_id,
            "order_date": "2026-04-23",
            "product_name": "Basmati Rice",
            "category": "grains",
            "quantity": 500,
            "unit": "kg",
            "unit_price": 125.00,
            "amount": 62500.00,
            "gst_rate": 5,
            "gst_amount": 3125.00,
            "total": 65625.00,
            "status": "pending",
        }
        pdf_bytes = await generate_invoice_pdf(bill_data)
        return {
            "status": "generated",
            "bill_ref": bill_data["bill_ref"],
            "total": bill_data["total"],
            "pdf_size": len(pdf_bytes),
        }

    # Try to find existing bill for this order
    docs = firestore_service.db.collection("bills").where("order_id", "==", order_id).limit(1).stream()
    bill = None
    async for doc in docs:
        bill = doc.to_dict()
        break

    if not bill:
        raise HTTPException(status_code=404, detail=f"No bill found for order {order_id}")

    for k in ["amount", "gst_rate", "gst_amount", "total", "unit_price"]:
        if k in bill and bill[k] is not None:
            bill[k] = float(bill[k])

    pdf_bytes = await generate_invoice_pdf(bill)

    return {
        "status": "generated",
        "bill_ref": bill["bill_ref"],
        "total": bill.get("total", 0),
        "pdf_size": len(pdf_bytes),
    }
