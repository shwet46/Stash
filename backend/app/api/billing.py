"""Billing API endpoints"""
from fastapi import APIRouter, Query
from app.services.firestore_service import firestore_service
from app.services.billing_pdf import generate_invoice_pdf
from typing import Optional

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
        for k in ["amount", "gst_rate", "gst_amount", "total"]:
            if k in b and b[k] is not None:
                b[k] = float(b[k])
        bills.append(b)

    # Sort by created_at desc (in python)
    bills.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    return bills


@router.post("/generate/{order_id}")
async def generate_bill(order_id: str):
    """Generate invoice PDF for an order"""
    # In production, fetch order details and generate PDF
    bill_data = {
        "bill_ref": f"INV-{order_id[:4]}",
        "buyer_name": "Demo Buyer",
        "buyer_phone": "+91 98765 43210",
        "order_ref": order_id,
        "order_date": "2026-04-23",
        "product_name": "Basmati Rice",
        "quantity": 500,
        "unit": "kg",
        "unit_price": 125.00,
        "amount": 62500.00,
        "gst_rate": 5,
        "gst_amount": 3125.00,
        "total": 65625.00,
    }

    pdf_bytes = await generate_invoice_pdf(bill_data)

    return {
        "status": "generated",
        "bill_ref": bill_data["bill_ref"],
        "total": bill_data["total"],
        "pdf_size": len(pdf_bytes),
    }
