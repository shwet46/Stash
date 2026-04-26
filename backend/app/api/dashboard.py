"""Dashboard API — real-time role-aware stats from Firestore"""
import asyncio
import json
from datetime import datetime, timedelta
from typing import AsyncGenerator

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────

def _stock_status(item: dict) -> str:
    stock = float(item.get("current_stock", 0))
    threshold = float(item.get("threshold", 0))
    if stock < threshold * 0.5:
        return "critical"
    elif stock < threshold:
        return "low"
    return "healthy"

async def _fetch_collection(name: str):
    if not firestore_service.is_enabled:
        return []
    docs = firestore_service.db.collection(name).stream()
    items = []
    async for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        items.append(d)
    return items

async def _build_admin_stats() -> dict:
    """Full business stats for Admin/Owner role."""
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    all_orders = await _fetch_collection("orders")
    active_orders = [o for o in all_orders if o.get("status") in ("pending", "dispatched", "in_transit")]
    monthly_orders = [o for o in all_orders if o.get("created_at") and o.get("created_at") >= month_start]

    monthly_revenue = sum(float(o.get("total_amount") or 0) for o in monthly_orders)

    revenue_history = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date().isoformat()
        day_orders = [o for o in all_orders if o.get("created_at") and o.get("created_at", "").startswith(day)]
        day_revenue = sum(float(o.get("total_amount") or 0) for o in day_orders)
        revenue_history.append({
            "date": (now - timedelta(days=i)).strftime("%b %d"),
            "revenue": day_revenue,
            "orders": len(day_orders)
        })

    inventory = await _fetch_collection("inventory")
    total_inv_value = sum(float(item.get("current_stock", 0)) * 10 for item in inventory)
    low_stock = [i for i in inventory if _stock_status(i) in ("low", "critical")]
    critical_stock = [i for i in inventory if _stock_status(i) == "critical"]

    categories = {}
    for item in inventory:
        cat = item.get("category") or "Other"
        if cat not in categories:
            categories[cat] = {"value": 0, "count": 0}
        categories[cat]["value"] += float(item.get("current_stock", 0)) * 10
        categories[cat]["count"] += 1
    
    category_distribution = [
        {"name": cat, "value": data["value"], "count": data["count"]}
        for cat, data in categories.items()
    ]

    bills = await _fetch_collection("bills")
    pending_payments = sum(float(b.get("total") or 0) for b in bills if b.get("status") != "paid")
    collected = sum(float(b.get("total") or 0) for b in bills if b.get("status") == "paid")

    suppliers = await _fetch_collection("suppliers")
    buyers = await _fetch_collection("buyers")

    deliveries = await _fetch_collection("delivery_updates")
    in_transit = [d for d in deliveries if d.get("status") in ("in_transit", "dispatched")]

    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    all_calls = await _fetch_collection("voice_commands")
    calls_today = [c for c in all_calls if c.get("created_at") and c.get("created_at") >= today_start and c.get("status") == "processed"]

    users = await _fetch_collection("users")
    workers = [u for u in users if u.get("role", "").lower() == "worker"]

    return {
        "role": "admin",
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
            "worker_count": len(workers),
        },
        "revenue_history": revenue_history,
        "category_distribution": sorted(category_distribution, key=lambda x: x["value"], reverse=True)[:5],
        "low_stock_items": [
            {
                "id": str(i.get("id")),
                "product_name": i.get("product_name"),
                "current_stock": i.get("current_stock"),
                "threshold": i.get("threshold"),
                "unit": i.get("unit"),
                "status": _stock_status(i),
            }
            for i in low_stock[:5]
        ],
        "recent_orders": [
            {
                "id": str(o.get("id")),
                "order_ref": o.get("order_ref"),
                "quantity": o.get("quantity"),
                "status": o.get("status"),
                "total_amount": float(o.get("total_amount") or 0),
                "created_at": o.get("created_at"),
            }
            for o in sorted(all_orders, key=lambda x: x.get("created_at") or "", reverse=True)[:8]
        ],
        "recent_bills": [
            {
                "id": str(b.get("id")),
                "bill_ref": b.get("bill_ref"),
                "amount": float(b.get("amount") or 0),
                "total": float(b.get("total") or 0),
                "status": b.get("status"),
                "created_at": b.get("created_at"),
            }
            for b in sorted(bills, key=lambda x: x.get("created_at") or "", reverse=True)[:5]
        ],
        "staff": [
            {
                "id": str(u.get("id")),
                "name": u.get("name"),
                "role": u.get("role"),
                "phone": u.get("phone"),
            }
            for u in users
        ],
        "last_updated": now.isoformat(),
    }


async def _build_worker_stats(user_id: str | None = None) -> dict:
    """Task and delivery focused stats for Worker role."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    all_orders = await _fetch_collection("orders")
    active_orders = [o for o in all_orders if o.get("status") in ("pending", "dispatched")]

    inventory = await _fetch_collection("inventory")
    low_stock = [i for i in inventory if _stock_status(i) in ("low", "critical")]

    all_calls = await _fetch_collection("voice_commands")
    calls = sorted(all_calls, key=lambda x: x.get("created_at") or "", reverse=True)[:5]

    tasks = []
    for order in active_orders[:4]:
        tasks.append({
            "id": f"task-order-{order.get('id')}",
            "task": f"Pack/process order {order.get('order_ref')}",
            "product": "—",
            "qty": f"{order.get('quantity')} units",
            "location": "Godown Bay",
            "priority": "high" if order.get("status") == "pending" else "medium",
            "status": "pending" if order.get("status") == "pending" else "in_progress",
            "due_time": "Today",
            "source": "order",
        })

    for item in low_stock[:2]:
        tasks.append({
            "id": f"task-stock-{item.get('id')}",
            "task": f"Restock / count {item.get('product_name')}",
            "product": item.get("product_name"),
            "qty": f"{item.get('current_stock')} {item.get('unit') or ''} remaining",
            "location": "Storage area",
            "priority": "high" if _stock_status(item) == "critical" else "medium",
            "status": "pending",
            "due_time": "ASAP",
            "source": "inventory",
        })

    deliveries = await _fetch_collection("delivery_updates")
    active_deliveries = [d for d in deliveries if d.get("status") in ("in_transit", "dispatched")]

    def format_time(iso_str):
        if not iso_str: return ""
        try:
            return datetime.fromisoformat(iso_str).strftime("%I:%M %p")
        except:
            return iso_str

    return {
        "role": "worker",
        "stats": {
            "total_tasks": len(tasks),
            "pending_tasks": len([t for t in tasks if t["status"] == "pending"]),
            "voice_commands_today": len([c for c in all_calls if c.get("created_at") and c.get("created_at") >= today_start]),
            "active_deliveries": len(active_deliveries),
            "low_stock_count": len(low_stock),
        },
        "tasks": tasks,
        "recent_calls": [
            {
                "id": str(c.get("id")),
                "text": c.get("activity_summary") or c.get("response") or c.get("transcript") or c.get("intent") or "Voice command",
                "activity_summary": c.get("activity_summary"),
                "time": format_time(c.get("created_at")),
                "status": "Processed" if c.get("status") == "processed" else "Pending",
            }
            for c in calls
        ],
        "active_deliveries": [
            {
                "id": str(d.get("id")),
                "order_id": str(d.get("order_id")) if d.get("order_id") else None,
                "status": d.get("status"),
                "note": d.get("note"),
                "updated_at": d.get("updated_at"),
            }
            for d in active_deliveries[:3]
        ],
        "last_updated": now.isoformat(),
    }


async def _build_recent_activities(role: str | None = None, limit: int = 12) -> dict:
    now = datetime.utcnow()
    all_calls = await _fetch_collection("voice_commands")
    role_lower = (role or "").lower()

    if role_lower in ("admin", "owner"):
        filtered_calls = all_calls
    elif role_lower == "worker":
        filtered_calls = [
            c for c in all_calls
            if (c.get("role") or "worker").lower() == "worker" or (c.get("source") or "").lower() == "worker_dashboard"
        ]
    else:
        filtered_calls = all_calls

    def format_time(iso_str):
        if not iso_str:
            return ""
        try:
            return datetime.fromisoformat(iso_str).strftime("%I:%M %p")
        except Exception:
            return iso_str

    recent = sorted(filtered_calls, key=lambda x: x.get("created_at") or "", reverse=True)[:limit]
    items = [
        {
            "id": str(c.get("id")),
            "activity": c.get("activity_summary") or c.get("response") or c.get("transcript") or c.get("intent") or "Voice activity",
            "intent": c.get("intent"),
            "role": c.get("role") or "worker",
            "source": c.get("source") or "web",
            "status": c.get("status") or "processed",
            "time": format_time(c.get("created_at")),
            "created_at": c.get("created_at"),
        }
        for c in recent
    ]

    return {
        "role": role_lower or "worker",
        "items": items,
        "total": len(filtered_calls),
        "last_updated": now.isoformat(),
    }


# ─────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────

@router.get("/admin")
@router.get("/owner")
async def admin_dashboard():
    """Real-time admin dashboard data from Firestore."""
    return await _build_admin_stats()


@router.get("/worker")
async def worker_dashboard():
    """Real-time worker dashboard data from Firestore."""
    return await _build_worker_stats()


@router.get("/summary")
async def dashboard_summary():
    """Quick KPI summary for all roles."""
    inventory = await _fetch_collection("inventory")
    orders = await _fetch_collection("orders")
    bills = await _fetch_collection("bills")

    return {
        "total_products": len(inventory),
        "active_orders": len([o for o in orders if o.get("status") in ("pending", "dispatched")]),
        "monthly_revenue": sum(float(b.get("total") or 0) for b in bills if b.get("status") == "paid"),
        "low_stock_count": len([i for i in inventory if _stock_status(i) != "healthy"]),
        "critical_count": len([i for i in inventory if _stock_status(i) == "critical"]),
        "pending_payments": sum(float(b.get("total") or 0) for b in bills if b.get("status") != "paid"),
        "last_updated": datetime.utcnow().isoformat(),
    }


@router.get("/activities")
async def dashboard_activities(role: str | None = None, limit: int = 12):
    """Recent voice activities for admin and worker dashboards."""
    return await _build_recent_activities(role=role, limit=limit)


# ─────────────────────────────────────────
# SSE — Server-Sent Events for real-time push
# ─────────────────────────────────────────

async def _sse_generator(request: Request, role: str) -> AsyncGenerator[str, None]:
    """Yield real-time stats every 15 seconds via SSE."""
    try:
        while True:
            if await request.is_disconnected():
                break
            try:
                role_lower = role.lower()
                if role_lower in ("admin", "owner"):
                    data = await _build_admin_stats()
                else:
                    data = await _build_worker_stats()

                yield f"data: {json.dumps(data)}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

            await asyncio.sleep(15)
    except asyncio.CancelledError:
        pass


@router.get("/stream/{role}")
async def dashboard_stream(role: str, request: Request):
    """SSE endpoint — streams real-time dashboard data every 15s."""
    valid_roles = {"admin", "owner", "worker"}
    role_lower = role.lower()
    if role_lower not in valid_roles:
        role_lower = "worker"

    return StreamingResponse(
        _sse_generator(request, role_lower),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
