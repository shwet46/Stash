"""Orders API endpoints"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.orders import Order
from typing import Optional

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("")
async def list_orders(
    status: Optional[str] = Query(None),
    buyer_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List all orders with optional filters"""
    query = select(Order)

    if status:
        query = query.where(Order.status == status)
    if buyer_id:
        query = query.where(Order.buyer_id == buyer_id)
    if search:
        query = query.where(Order.order_ref.ilike(f"%{search}%"))

    result = await db.execute(query.order_by(Order.created_at.desc()))
    orders = result.scalars().all()

    return [
        {
            "id": str(o.id),
            "order_ref": o.order_ref,
            "buyer_id": str(o.buyer_id) if o.buyer_id else None,
            "product_id": str(o.product_id) if o.product_id else None,
            "quantity": o.quantity,
            "status": o.status,
            "estimated_delivery": str(o.estimated_delivery) if o.estimated_delivery else None,
            "total_amount": float(o.total_amount) if o.total_amount else 0,
            "created_at": str(o.created_at),
        }
        for o in orders
    ]


@router.post("")
async def create_order(data: dict, db: AsyncSession = Depends(get_db)):
    """Create a new order"""
    import uuid
    import random

    order = Order(
        id=uuid.uuid4(),
        order_ref=f"STH-{random.randint(1000, 9999)}",
        buyer_id=data.get("buyer_id"),
        product_id=data.get("product_id"),
        quantity=data.get("quantity", 0),
        status="pending",
        total_amount=data.get("total_amount", 0),
    )
    db.add(order)
    await db.commit()

    return {"status": "created", "order_ref": order.order_ref, "id": str(order.id)}


@router.get("/{order_ref}")
async def get_order(order_ref: str, db: AsyncSession = Depends(get_db)):
    """Get order by reference"""
    result = await db.execute(select(Order).where(Order.order_ref == order_ref))
    order = result.scalar_one_or_none()
    if not order:
        return {"error": "Order not found"}, 404

    return {
        "id": str(order.id),
        "order_ref": order.order_ref,
        "quantity": order.quantity,
        "status": order.status,
        "total_amount": float(order.total_amount) if order.total_amount else 0,
    }


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str, data: dict, db: AsyncSession = Depends(get_db)
):
    """Update order status"""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        return {"error": "Order not found"}, 404

    order.status = data.get("status", order.status)
    await db.commit()

    return {"status": "updated", "order_ref": order.order_ref}
