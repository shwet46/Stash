"""Delivery API endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.delivery import DeliveryUpdate

router = APIRouter(prefix="/api/delivery", tags=["delivery"])


@router.get("")
async def list_deliveries(db: AsyncSession = Depends(get_db)):
    """List all delivery updates"""
    result = await db.execute(
        select(DeliveryUpdate).order_by(DeliveryUpdate.updated_at.desc())
    )
    updates = result.scalars().all()

    return [
        {
            "id": str(u.id),
            "order_id": str(u.order_id) if u.order_id else None,
            "status": u.status,
            "note": u.note,
            "updated_at": str(u.updated_at),
        }
        for u in updates
    ]


@router.post("/{order_id}")
async def add_delivery_update(
    order_id: str, data: dict, db: AsyncSession = Depends(get_db)
):
    """Add a delivery status update"""
    import uuid

    update = DeliveryUpdate(
        id=uuid.uuid4(),
        order_id=order_id,
        status=data.get("status", ""),
        note=data.get("note", ""),
    )
    db.add(update)
    await db.commit()

    return {"status": "created", "id": str(update.id)}


@router.get("/{order_id}")
async def get_delivery_timeline(order_id: str, db: AsyncSession = Depends(get_db)):
    """Get delivery timeline for an order"""
    result = await db.execute(
        select(DeliveryUpdate)
        .where(DeliveryUpdate.order_id == order_id)
        .order_by(DeliveryUpdate.updated_at)
    )
    updates = result.scalars().all()

    return [
        {
            "status": u.status,
            "note": u.note,
            "updated_at": str(u.updated_at),
        }
        for u in updates
    ]
