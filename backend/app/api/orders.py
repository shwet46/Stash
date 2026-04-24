"""Orders API endpoints"""
from fastapi import APIRouter, Query, HTTPException
from datetime import datetime
import uuid
import random
from app.services.firestore_service import firestore_service
from typing import Optional

router = APIRouter(prefix="/api/orders", tags=["orders"])


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
    """Create a new order"""
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
        "product_id": data.get("product_id"),
        "quantity": data.get("quantity", 0),
        "status": "pending",
        "total_amount": float(data.get("total_amount", 0)),
        "created_at": datetime.utcnow().isoformat()
    }
    
    await firestore_service.db.collection("orders").document(order_id).set(order)

    return {"status": "created", "order_ref": order_ref, "id": order_id}


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

    return {"status": "updated", "order_ref": order.get("order_ref")}
