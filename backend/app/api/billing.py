"""Billing API endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.billing import Bill
from app.services.billing_pdf import generate_invoice_pdf
from typing import Optional
from fastapi import Query

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.get("")
async def list_bills(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List all bills"""
    query = select(Bill)
    if status:
        query = query.where(Bill.status == status)

    result = await db.execute(query.order_by(Bill.created_at.desc()))
    bills = result.scalars().all()

    return [
        {
            "id": str(b.id),
            "bill_ref": b.bill_ref,
            "order_id": str(b.order_id) if b.order_id else None,
            "buyer_id": str(b.buyer_id) if b.buyer_id else None,
            "amount": float(b.amount),
            "gst_rate": float(b.gst_rate),
            "gst_amount": float(b.gst_amount),
            "total": float(b.total),
            "status": b.status,
            "pdf_url": b.pdf_url,
            "created_at": str(b.created_at),
        }
        for b in bills
    ]


@router.post("/generate/{order_id}")
async def generate_bill(order_id: str, db: AsyncSession = Depends(get_db)):
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
