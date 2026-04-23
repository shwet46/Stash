"""Inventory API endpoints"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.inventory import Inventory
from typing import Optional

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("")
async def list_inventory(
    category: Optional[str] = Query(None),
    godown_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List all inventory items with optional filters"""
    query = select(Inventory)

    if category:
        query = query.where(Inventory.category == category)
    if godown_id:
        query = query.where(Inventory.godown_id == godown_id)
    if search:
        query = query.where(Inventory.product_name.ilike(f"%{search}%"))

    result = await db.execute(query)
    items = result.scalars().all()

    # Apply status filter in Python (derived field)
    if status:
        items = [
            item
            for item in items
            if _get_stock_status(item) == status
        ]

    return [
        {
            "id": str(item.id),
            "product_name": item.product_name,
            "category": item.category,
            "current_stock": item.current_stock,
            "threshold": item.threshold,
            "unit": item.unit,
            "expiry_date": str(item.expiry_date) if item.expiry_date else None,
            "godown_id": str(item.godown_id) if item.godown_id else None,
            "status": _get_stock_status(item),
            "last_updated": str(item.last_updated),
        }
        for item in items
    ]


@router.get("/{item_id}")
async def get_inventory_item(item_id: str, db: AsyncSession = Depends(get_db)):
    """Get single inventory item by ID"""
    result = await db.execute(select(Inventory).where(Inventory.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        return {"error": "Item not found"}, 404

    return {
        "id": str(item.id),
        "product_name": item.product_name,
        "category": item.category,
        "current_stock": item.current_stock,
        "threshold": item.threshold,
        "unit": item.unit,
        "expiry_date": str(item.expiry_date) if item.expiry_date else None,
        "status": _get_stock_status(item),
    }


@router.put("/{item_id}")
async def update_inventory(
    item_id: str, data: dict, db: AsyncSession = Depends(get_db)
):
    """Update inventory item (e.g. from voice command)"""
    result = await db.execute(select(Inventory).where(Inventory.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        return {"error": "Item not found"}, 404

    for key, value in data.items():
        if hasattr(item, key):
            setattr(item, key, value)

    await db.commit()
    return {"status": "updated", "id": str(item.id)}


@router.get("/summary/stats")
async def inventory_stats(db: AsyncSession = Depends(get_db)):
    """Get inventory summary statistics"""
    result = await db.execute(select(Inventory))
    items = result.scalars().all()

    total_items = len(items)
    low_stock = sum(1 for i in items if i.current_stock < i.threshold)
    critical = sum(1 for i in items if i.current_stock < i.threshold * 0.5)

    return {
        "total_products": total_items,
        "low_stock_count": low_stock,
        "critical_count": critical,
        "categories": len(set(i.category for i in items if i.category)),
    }


def _get_stock_status(item: Inventory) -> str:
    """Derive stock status from current stock vs threshold"""
    if item.current_stock < item.threshold * 0.5:
        return "critical"
    elif item.current_stock < item.threshold:
        return "low"
    return "healthy"
