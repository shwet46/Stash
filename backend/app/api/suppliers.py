"""Suppliers API endpoints"""
from fastapi import APIRouter, HTTPException
import uuid
from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])


@router.get("")
async def list_suppliers():
    """List all suppliers"""
    if not firestore_service.is_enabled:
        return []

    docs = firestore_service.db.collection("suppliers").stream()
    suppliers = []
    async for doc in docs:
        s = doc.to_dict()
        s["id"] = doc.id
        suppliers.append(s)

    suppliers.sort(key=lambda x: x.get("priority", 1))

    return suppliers


@router.post("")
async def create_supplier(data: dict):
    """Add a new supplier"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=500, detail="Firestore disabled")

    supplier_id = str(uuid.uuid4())
    supplier = {
        "id": supplier_id,
        "name": data["name"],
        "phone": data["phone"],
        "telegram_chat_id": data.get("telegram_chat_id"),
        "product_id": data.get("product_id"),
        "priority": data.get("priority", 1),
        "status": "active",
    }

    await firestore_service.db.collection("suppliers").document(supplier_id).set(supplier)

    return {"status": "created", "id": supplier_id}


@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str):
    """Get supplier by ID"""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=500, detail="Firestore disabled")

    doc = await firestore_service.db.collection("suppliers").document(supplier_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Supplier not found")

    supplier = doc.to_dict()
    supplier["id"] = doc.id

    return supplier
