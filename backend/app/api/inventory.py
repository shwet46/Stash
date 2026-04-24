"""Inventory API endpoints"""
from fastapi import APIRouter, Query, HTTPException
from app.services.firestore_service import firestore_service
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("")
async def list_inventory(
    category: Optional[str] = Query(None),
    godown_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """List all inventory items with optional filters"""
    if not firestore_service.is_enabled:
        return []

    collection = firestore_service.db.collection("inventory")
    query = collection

    if category:
        query = query.where("category", "==", category)
    if godown_id:
        query = query.where("godown_id", "==", godown_id)

    docs = query.stream()
    items = []
    async for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        item["status"] = _get_stock_status(item)
        items.append(item)

    if search:
        search_lower = search.lower()
        items = [i for i in items if i.get("product_name") and search_lower in i["product_name"].lower()]

    if status:
        items = [i for i in items if i.get("status") == status]

    return items


@router.get("/{item_id}")
async def get_inventory_item(item_id: str):
    """Get single inventory item by ID"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=500, detail="Firestore disabled")

    doc = await firestore_service.db.collection("inventory").document(item_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")

    item = doc.to_dict()
    item["id"] = doc.id
    item["status"] = _get_stock_status(item)
    return item


@router.put("/{item_id}")
async def update_inventory(item_id: str, data: dict):
    """Update inventory item (e.g. from voice command)"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=500, detail="Firestore disabled")

    doc_ref = firestore_service.db.collection("inventory").document(item_id)
    doc = await doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")

    # Merge data
    update_payload = {k: v for k, v in data.items() if k in ["product_name", "category", "current_stock", "threshold", "unit", "expiry_date", "godown_id"]}
    update_payload["last_updated"] = datetime.utcnow().isoformat()
    
    await doc_ref.update(update_payload)

    return {"status": "updated", "id": item_id}


@router.get("/summary/stats")
async def inventory_stats():
    """Get inventory summary statistics"""
    if not firestore_service.is_enabled:
        return {
            "total_products": 0,
            "low_stock_count": 0,
            "critical_count": 0,
            "categories": 0,
        }

    docs = firestore_service.db.collection("inventory").stream()
    items = []
    async for doc in docs:
        items.append(doc.to_dict())

    total_items = len(items)
    low_stock = sum(1 for i in items if i.get("current_stock", 0) < i.get("threshold", 0))
    critical = sum(1 for i in items if i.get("current_stock", 0) < i.get("threshold", 0) * 0.5)
    categories = len(set(i.get("category") for i in items if i.get("category")))

    return {
        "total_products": total_items,
        "low_stock_count": low_stock,
        "critical_count": critical,
        "categories": categories,
    }


def _get_stock_status(item: dict) -> str:
    """Derive stock status from current stock vs threshold"""
    stock = float(item.get("current_stock", 0))
    threshold = float(item.get("threshold", 0))
    if stock < threshold * 0.5:
        return "critical"
    elif stock < threshold:
        return "low"
    return "healthy"
