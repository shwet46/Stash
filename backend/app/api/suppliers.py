"""Suppliers API endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.suppliers import Supplier

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])


@router.get("")
async def list_suppliers(db: AsyncSession = Depends(get_db)):
    """List all suppliers"""
    result = await db.execute(select(Supplier).order_by(Supplier.priority))
    suppliers = result.scalars().all()

    return [
        {
            "id": str(s.id),
            "name": s.name,
            "phone": s.phone,
            "telegram_chat_id": s.telegram_chat_id,
            "product_id": str(s.product_id) if s.product_id else None,
            "priority": s.priority,
            "status": s.status,
            "last_contacted": str(s.last_contacted) if s.last_contacted else None,
        }
        for s in suppliers
    ]


@router.post("")
async def create_supplier(data: dict, db: AsyncSession = Depends(get_db)):
    """Add a new supplier"""
    import uuid

    supplier = Supplier(
        id=uuid.uuid4(),
        name=data["name"],
        phone=data["phone"],
        telegram_chat_id=data.get("telegram_chat_id"),
        product_id=data.get("product_id"),
        priority=data.get("priority", 1),
        status="active",
    )
    db.add(supplier)
    await db.commit()

    return {"status": "created", "id": str(supplier.id)}


@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str, db: AsyncSession = Depends(get_db)):
    """Get supplier by ID"""
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        return {"error": "Supplier not found"}, 404

    return {
        "id": str(supplier.id),
        "name": supplier.name,
        "phone": supplier.phone,
        "priority": supplier.priority,
        "status": supplier.status,
    }
