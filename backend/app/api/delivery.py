"""Delivery API endpoints"""
from fastapi import APIRouter, HTTPException
import uuid
from datetime import datetime
from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/api/delivery", tags=["delivery"])


@router.get("")
async def list_deliveries():
    """List all delivery updates"""
    if not firestore_service.is_enabled:
        return []

    docs = firestore_service.db.collection("delivery_updates").stream()
    updates = []
    async for doc in docs:
        u = doc.to_dict()
        u["id"] = doc.id
        updates.append(u)

    updates.sort(key=lambda x: x.get("updated_at") or "", reverse=True)

    return updates


@router.post("/{order_id}")
async def add_delivery_update(order_id: str, data: dict):
    """Add a delivery status update"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=500, detail="Firestore disabled")

    update_id = str(uuid.uuid4())
    update = {
        "id": update_id,
        "order_id": order_id,
        "status": data.get("status", ""),
        "note": data.get("note", ""),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    await firestore_service.db.collection("delivery_updates").document(update_id).set(update)

    return {"status": "created", "id": update_id}


@router.get("/{order_id}")
async def get_delivery_timeline(order_id: str):
    """Get delivery timeline for an order"""
    if not firestore_service.is_enabled:
        return []

    docs = firestore_service.db.collection("delivery_updates").where("order_id", "==", order_id).stream()
    updates = []
    async for doc in docs:
        updates.append(doc.to_dict())

    updates.sort(key=lambda x: x.get("updated_at") or "")

    return updates
