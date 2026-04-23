"""Dashboard API — real-time role-aware stats from PostgreSQL + Firestore"""
import asyncio
import json
from datetime import datetime, timedelta, date
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.delivery import User, DeliveryUpdate, CallLog
from app.models.inventory import Inventory
from app.models.orders import Order
from app.models.billing import Bill
from app.models.suppliers import Supplier
from app.models.buyers import Buyer
from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────

def _stock_status(item: Inventory) -> str:
    if item.current_stock < item.threshold * 0.5:
        return "critical"
    elif item.current_stock < item.threshold:
        return "low"
    return "healthy"


async def _build_owner_stats(db: AsyncSession) -> dict:
    """Full business stats for Owner/Admin role."""
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Orders
    orders_result = await db.execute(select(Order))
    all_orders = orders_result.scalars().all()
    active_orders = [o for o in all_orders if o.status in ("pending", "dispatched", "in_transit")]
    monthly_orders = [o for o in all_orders if o.created_at and o.created_at >= month_start]

    # Monthly revenue
    monthly_revenue = sum(
        float(o.total_amount or 0) for o in monthly_orders
    )

    # Inventory
    inv_result = await db.execute(select(Inventory))
    inventory = inv_result.scalars().all()
    total_inv_value = sum(
        (item.current_stock or 0) * 10 for item in inventory  # placeholder unit price
    )
    low_stock = [i for i in inventory if _stock_status(i) in ("low", "critical")]
    critical_stock = [i for i in inventory if _stock_status(i) == "critical"]

    # Bills
    bills_result = await db.execute(select(Bill))
    bills = bills_result.scalars().all()
    pending_payments = sum(float(b.total or 0) for b in bills if b.status != "paid")
    collected = sum(float(b.total or 0) for b in bills if b.status == "paid")

    # Suppliers & Buyers
    sup_result = await db.execute(select(Supplier))
    suppliers = sup_result.scalars().all()
    buyer_result = await db.execute(select(Buyer))
    buyers = buyer_result.scalars().all()

    # Deliveries
    del_result = await db.execute(select(DeliveryUpdate))
    deliveries = del_result.scalars().all()
    in_transit = [d for d in deliveries if d.status in ("in_transit", "dispatched")]

    # Call logs (voice)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    calls_result = await db.execute(
        select(CallLog).where(CallLog.created_at >= today_start)
    )
    calls_today = calls_result.scalars().all()

    # Users / Staff
    users_result = await db.execute(select(User))
    users = users_result.scalars().all()
    operators = [u for u in users if u.role in ("operator",)]
    workers = [u for u in users if u.role == "worker"]

    return {
        "role": "owner",
        "stats": {
            "monthly_revenue": monthly_revenue,
            "active_orders": len(active_orders),
            "total_orders": len(all_orders),
            "inventory_value": total_inv_value,
            "total_products": len(inventory),
            "low_stock_count": len(low_stock),
            "critical_count": len(critical_stock),
            "pending_payments": pending_payments,
            "collected_revenue": collected,
            "supplier_count": len(suppliers),
            "buyer_count": len(buyers),
            "deliveries_in_transit": len(in_transit),
            "voice_calls_today": len(calls_today),
            "staff_count": len(users),
            "operator_count": len(operators),
            "worker_count": len(workers),
        },
        "low_stock_items": [
            {
                "id": str(i.id),
                "product_name": i.product_name,
                "current_stock": i.current_stock,
                "threshold": i.threshold,
                "unit": i.unit,
                "status": _stock_status(i),
            }
            for i in low_stock[:5]
        ],
        "recent_orders": [
            {
                "id": str(o.id),
                "order_ref": o.order_ref,
                "quantity": o.quantity,
                "status": o.status,
                "total_amount": float(o.total_amount or 0),
                "created_at": str(o.created_at),
            }
            for o in sorted(all_orders, key=lambda x: x.created_at or datetime.min, reverse=True)[:8]
        ],
        "recent_bills": [
            {
                "id": str(b.id),
                "bill_ref": b.bill_ref,
                "amount": float(b.amount or 0),
                "total": float(b.total or 0),
                "status": b.status,
                "created_at": str(b.created_at),
            }
            for b in sorted(bills, key=lambda x: x.created_at or datetime.min, reverse=True)[:5]
        ],
        "staff": [
            {
                "id": str(u.id),
                "name": u.name,
                "role": u.role,
                "phone": u.phone,
            }
            for u in users
        ],
        "last_updated": now.isoformat(),
    }


async def _build_operator_stats(db: AsyncSession) -> dict:
    """Operations-focused stats for Operator role."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Orders
    orders_result = await db.execute(select(Order))
    all_orders = orders_result.scalars().all()
    pending_orders = [o for o in all_orders if o.status == "pending"]
    today_orders = [o for o in all_orders if o.created_at and o.created_at >= today_start]

    # Inventory
    inv_result = await db.execute(select(Inventory))
    inventory = inv_result.scalars().all()
    critical = [i for i in inventory if _stock_status(i) == "critical"]
    low = [i for i in inventory if _stock_status(i) == "low"]

    # Deliveries
    del_result = await db.execute(select(DeliveryUpdate))
    deliveries = del_result.scalars().all()
    active_deliveries = [d for d in deliveries if d.status in ("in_transit", "dispatched")]

    return {
        "role": "operator",
        "stats": {
            "pending_orders": len(pending_orders),
            "today_orders": len(today_orders),
            "total_active_orders": len([o for o in all_orders if o.status in ("pending", "dispatched")]),
            "critical_stock": len(critical),
            "low_stock": len(low),
            "active_deliveries": len(active_deliveries),
            "total_products": len(inventory),
        },
        "pending_orders": [
            {
                "id": str(o.id),
                "order_ref": o.order_ref,
                "quantity": o.quantity,
                "status": o.status,
                "total_amount": float(o.total_amount or 0),
                "created_at": str(o.created_at),
                "estimated_delivery": str(o.estimated_delivery) if o.estimated_delivery else None,
            }
            for o in sorted(pending_orders, key=lambda x: x.created_at or datetime.min, reverse=True)[:10]
        ],
        "alert_stock": [
            {
                "id": str(i.id),
                "product_name": i.product_name,
                "current_stock": i.current_stock,
                "threshold": i.threshold,
                "unit": i.unit,
                "status": _stock_status(i),
            }
            for i in (critical + low)[:6]
        ],
        "active_deliveries": [
            {
                "id": str(d.id),
                "order_id": str(d.order_id) if d.order_id else None,
                "status": d.status,
                "note": d.note,
                "updated_at": str(d.updated_at),
            }
            for d in active_deliveries[:5]
        ],
        "inventory_summary": [
            {
                "id": str(i.id),
                "product_name": i.product_name,
                "current_stock": i.current_stock,
                "threshold": i.threshold,
                "unit": i.unit,
                "category": i.category,
                "status": _stock_status(i),
            }
            for i in inventory[:8]
        ],
        "last_updated": now.isoformat(),
    }


async def _build_worker_stats(db: AsyncSession, user_id: str | None = None) -> dict:
    """Task and delivery focused stats for Worker role."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Get recent orders for packing tasks
    orders_result = await db.execute(
        select(Order).where(Order.status.in_(["pending", "dispatched"]))
    )
    active_orders = orders_result.scalars().all()

    # Get inventory for stock-count tasks
    inv_result = await db.execute(select(Inventory))
    inventory = inv_result.scalars().all()
    low_stock = [i for i in inventory if _stock_status(i) in ("low", "critical")]

    # Voice calls
    calls_result = await db.execute(
        select(CallLog).where(CallLog.created_at >= today_start)
    )
    calls_today = calls_result.scalars().all()

    # Build task list from real order + inventory data
    tasks = []
    for i, order in enumerate(active_orders[:3]):
        tasks.append({
            "id": f"task-order-{order.id}",
            "task": f"Pack/process order {order.order_ref}",
            "product": "—",
            "qty": f"{order.quantity} units",
            "location": "Godown Bay",
            "priority": "high" if order.status == "pending" else "medium",
            "status": "pending" if order.status == "pending" else "in_progress",
            "due_time": "Today",
            "source": "order",
        })

    for item in low_stock[:2]:
        tasks.append({
            "id": f"task-stock-{item.id}",
            "task": f"Restock / count {item.product_name}",
            "product": item.product_name,
            "qty": f"{item.current_stock} {item.unit or ''} remaining",
            "location": "Storage area",
            "priority": "high" if _stock_status(item) == "critical" else "medium",
            "status": "pending",
            "due_time": "ASAP",
            "source": "inventory",
        })

    # Deliveries worker might be responsible for
    del_result = await db.execute(select(DeliveryUpdate))
    deliveries = del_result.scalars().all()
    active_deliveries = [d for d in deliveries if d.status in ("in_transit", "dispatched")]

    return {
        "role": "worker",
        "stats": {
            "total_tasks": len(tasks),
            "pending_tasks": len([t for t in tasks if t["status"] == "pending"]),
            "voice_commands_today": len(calls_today),
            "active_deliveries": len(active_deliveries),
        },
        "tasks": tasks,
        "active_deliveries": [
            {
                "id": str(d.id),
                "order_id": str(d.order_id) if d.order_id else None,
                "status": d.status,
                "note": d.note,
                "updated_at": str(d.updated_at),
            }
            for d in active_deliveries[:3]
        ],
        "last_updated": now.isoformat(),
    }


# ─────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────

@router.get("/owner")
async def owner_dashboard(db: AsyncSession = Depends(get_db)):
    """Real-time owner dashboard data from PostgreSQL."""
    return await _build_owner_stats(db)


@router.get("/operator")
async def operator_dashboard(db: AsyncSession = Depends(get_db)):
    """Real-time operator dashboard data from PostgreSQL."""
    return await _build_operator_stats(db)


@router.get("/worker")
async def worker_dashboard(db: AsyncSession = Depends(get_db)):
    """Real-time worker dashboard data from PostgreSQL."""
    return await _build_worker_stats(db)


@router.get("/summary")
async def dashboard_summary(db: AsyncSession = Depends(get_db)):
    """Quick KPI summary for all roles."""
    inv_result = await db.execute(select(Inventory))
    inventory = inv_result.scalars().all()
    orders_result = await db.execute(select(Order))
    orders = orders_result.scalars().all()
    bills_result = await db.execute(select(Bill))
    bills = bills_result.scalars().all()

    return {
        "total_products": len(inventory),
        "active_orders": len([o for o in orders if o.status in ("pending", "dispatched")]),
        "monthly_revenue": sum(float(b.total or 0) for b in bills if b.status == "paid"),
        "low_stock_count": len([i for i in inventory if _stock_status(i) != "healthy"]),
        "critical_count": len([i for i in inventory if _stock_status(i) == "critical"]),
        "pending_payments": sum(float(b.total or 0) for b in bills if b.status != "paid"),
        "last_updated": datetime.utcnow().isoformat(),
    }


# ─────────────────────────────────────────
# SSE — Server-Sent Events for real-time push
# ─────────────────────────────────────────

async def _sse_generator(request: Request, db: AsyncSession, role: str) -> AsyncGenerator[str, None]:
    """Yield real-time stats every 15 seconds via SSE."""
    try:
        while True:
            if await request.is_disconnected():
                break
            try:
                if role == "owner":
                    data = await _build_owner_stats(db)
                elif role == "operator":
                    data = await _build_operator_stats(db)
                else:
                    data = await _build_worker_stats(db)

                yield f"data: {json.dumps(data)}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

            await asyncio.sleep(15)
    except asyncio.CancelledError:
        pass


@router.get("/stream/{role}")
async def dashboard_stream(role: str, request: Request, db: AsyncSession = Depends(get_db)):
    """SSE endpoint — streams real-time dashboard data every 15s."""
    valid_roles = {"owner", "operator", "worker"}
    if role not in valid_roles:
        role = "worker"

    return StreamingResponse(
        _sse_generator(request, db, role),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
