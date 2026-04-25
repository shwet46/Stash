"""Orders API endpoints"""
from fastapi import APIRouter, Query, HTTPException
from datetime import datetime
import uuid
import random
from app.services.firestore_service import firestore_service
from app.services.billing_pdf import get_gst_rate_for_category
from typing import Optional

router = APIRouter(prefix="/api/orders", tags=["orders"])


async def _create_bill_for_order(order: dict, product: dict | None) -> str:
    """Auto-generate a GST bill in Firestore for a new order."""
    bill_id = str(uuid.uuid4())
    bill_ref = f"INV-{order['order_ref'].replace('STH-', '')}"

    # Determine GST rate from product category
    category = (product or {}).get("category", "grains")
    gst_rate = get_gst_rate_for_category(category)

    amount = float(order.get("total_amount", 0))
    gst_amount = round(amount * gst_rate / 100, 2)
    total = round(amount + gst_amount, 2)

    product_name = (product or {}).get("product_name", order.get("product_name", "Product"))
    unit = (product or {}).get("unit", order.get("unit", "units"))
    quantity = order.get("quantity", 0)
    unit_price = round(amount / quantity, 2) if quantity else 0

    bill = {
        "id": bill_id,
        "bill_ref": bill_ref,
        "order_ref": order["order_ref"],
        "order_id": order["id"],
        "buyer_name": order.get("buyer_name", ""),
        "buyer_phone": order.get("phone", ""),
        "buyer_address": order.get("buyer_address", ""),
        "buyer_gstin": order.get("buyer_gstin", ""),
        "product_name": product_name,
        "product_id": order.get("product_id", ""),
        "category": category,
        "quantity": quantity,
        "unit": unit,
        "unit_price": unit_price,
        "amount": amount,
        "gst_rate": gst_rate,
        "gst_amount": gst_amount,
        "total": total,
        "is_intrastate": True,
        "status": "pending",
        "order_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "created_at": datetime.utcnow().isoformat(),
    }

    await firestore_service.db.collection("bills").document(bill_id).set(bill)
    return bill_ref


@router.get("")
async def list_orders(
    status: Optional[str] = Query(None),
    buyer_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """List all orders with optional filters"""
    if not firestore_service.is_enabled:
        return []

    collection = firestore_service.db.collection("orders")
    query = collection

    if status:
        query = query.where("status", "==", status)
    if buyer_id:
        query = query.where("buyer_id", "==", buyer_id)

    docs = query.stream()
    orders = []
    async for doc in docs:
        o = doc.to_dict()
        o["id"] = doc.id
        if "total_amount" in o and o["total_amount"] is not None:
            o["total_amount"] = float(o["total_amount"])
        orders.append(o)

    if search:
        search_lower = search.lower()
        orders = [o for o in orders if o.get("order_ref") and search_lower in o["order_ref"].lower()]

    orders.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return orders


@router.post("")
async def create_order(data: dict):
    """Create a new order and auto-generate a GST bill"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=500, detail="Firestore disabled")

    order_id = str(uuid.uuid4())
    order_ref = f"STH-{random.randint(1000, 9999)}"

    order = {
        "id": order_id,
        "order_ref": order_ref,
        "buyer_id": data.get("buyer_id"),
        "buyer_name": data.get("buyer_name"),
        "phone": data.get("phone"),
        "buyer_address": data.get("buyer_address", ""),
        "buyer_gstin": data.get("buyer_gstin", ""),
        "product_id": data.get("product_id"),
        "product_name": data.get("product_name", ""),
        "unit": data.get("unit", "units"),
        "quantity": data.get("quantity", 0),
        "status": "pending",
        "total_amount": float(data.get("total_amount", 0)),
        "created_at": datetime.utcnow().isoformat()
    }

    await firestore_service.db.collection("orders").document(order_id).set(order)

    # Fetch product details for GST rate lookup
    product = None
    if data.get("product_id") and firestore_service.is_enabled:
        try:
            product_doc = await firestore_service.db.collection("inventory").document(data["product_id"]).get()
            if product_doc.exists:
                product = product_doc.to_dict()
        except Exception:
            pass

    # Auto-generate bill
    bill_ref = await _create_bill_for_order(order, product)

    return {"status": "created", "order_ref": order_ref, "id": order_id, "bill_ref": bill_ref}


@router.get("/{order_ref}")
async def get_order(order_ref: str):
    """Get order by reference"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=500, detail="Firestore disabled")

    docs = firestore_service.db.collection("orders").where("order_ref", "==", order_ref).limit(1).stream()
    order = None
    async for doc in docs:
        order = doc.to_dict()
        order["id"] = doc.id
        break

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if "total_amount" in order and order["total_amount"] is not None:
        order["total_amount"] = float(order["total_amount"])

    return order


@router.put("/{order_id}/status")
async def update_order_status(order_id: str, data: dict):
    """Update order status"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=500, detail="Firestore disabled")

    doc_ref = firestore_service.db.collection("orders").document(order_id)
    doc = await doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")

    order = doc.to_dict()
    new_status = data.get("status", order.get("status"))

    await doc_ref.update({
        "status": new_status,
        "updated_at": datetime.utcnow().isoformat()
    })

    # If order is marked as delivered/paid, also update the bill status
    if new_status in ("delivered", "paid") and firestore_service.is_enabled:
        try:
            order_ref_val = order.get("order_ref", "")
            bills_query = firestore_service.db.collection("bills").where("order_ref", "==", order_ref_val).limit(1).stream()
            async for bill_doc in bills_query:
                await bill_doc.reference.update({
                    "status": "paid",
                    "paid_at": datetime.utcnow().isoformat()
                })
                break
        except Exception:
            pass

    return {"status": "updated", "order_ref": order.get("order_ref")}
