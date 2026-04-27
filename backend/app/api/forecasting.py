"""
Forecasting API — Predictive Stockout Alerts & Reorder Recommendations
Endpoint prefix: /api/forecasting
"""
import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from app.services.firestore_service import firestore_service
from app.services.ml_pipeline import predict_stockout, generate_demand_forecast, get_model_status, _build_reason

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/forecasting", tags=["forecasting"])


# ─── Helpers ─────────────────────────────────────────────────────────────────

async def _get_inventory_items() -> list[dict]:
    """Fetch all inventory items from Firestore."""
    if not firestore_service.is_enabled:
        return []
    docs = firestore_service.db.collection("inventory").stream()
    items = []
    async for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        items.append(d)
    return items


async def _get_order_history_for_item(product_id: str, product_name: str) -> list[dict]:
    """Get recent orders for a specific product to compute avg daily demand."""
    if not firestore_service.is_enabled:
        return []
    try:
        query = firestore_service.db.collection("orders")
        # Try by product_id first, then product_name
        docs = query.where("product_id", "==", product_id).limit(60).stream()
        orders = []
        async for doc in docs:
            orders.append(doc.to_dict())

        if not orders and product_name:
            docs2 = query.where("product_name", "==", product_name).limit(60).stream()
            async for doc in docs2:
                orders.append(doc.to_dict())

        return orders
    except Exception as exc:
        logger.warning("Failed to fetch order history: %s", exc)
        return []


def _compute_demand_stats(orders: list[dict], current_stock: float) -> dict:
    """Compute avg_daily_sales_7d, avg_daily_sales_30d, sales_yesterday, demand_growth_pct from order history."""
    now = datetime.utcnow()
    cutoff_7 = (now.date() - __import__("datetime").timedelta(days=7)).isoformat()
    cutoff_30 = (now.date() - __import__("datetime").timedelta(days=30)).isoformat()
    yesterday = (now.date() - __import__("datetime").timedelta(days=1)).isoformat()

    def _qty(o):
        try:
            return float(o.get("quantity", 0) or 0)
        except (ValueError, TypeError):
            return 0.0

    orders_7d = [o for o in orders if (o.get("created_at") or "") >= cutoff_7]
    orders_30d = [o for o in orders if (o.get("created_at") or "") >= cutoff_30]
    orders_yesterday = [o for o in orders if (o.get("created_at") or "").startswith(yesterday)]

    total_7d = sum(_qty(o) for o in orders_7d)
    total_30d = sum(_qty(o) for o in orders_30d)
    total_yesterday = sum(_qty(o) for o in orders_yesterday)

    # Default values if no orders found: assumes a very conservative 0.5% daily turnover
    # and 0% growth. This prevents new/stable items from being flagged as High Risk immediately.
    avg_7d = total_7d / 7 if orders_7d else max(0.1, current_stock * 0.005)
    avg_30d = total_30d / 30 if orders_30d else max(0.1, current_stock * 0.005)
    sales_yesterday = total_yesterday if orders_yesterday else (total_7d / 7 if orders_7d else 0.0)

    # Growth: (7d avg - 30d avg) / 30d avg
    demand_growth_pct = ((avg_7d - avg_30d) / avg_30d) if avg_30d > 0 else 0.0

    return {
        "avg_daily_sales_7d": round(avg_7d, 2),
        "avg_daily_sales_30d": round(avg_30d, 2),
        "sales_yesterday": round(sales_yesterday, 2),
        "demand_growth_pct": round(demand_growth_pct, 4),
        "orders_count": len(orders),
    }


def _map_category(category: str) -> str:
    """Map Firestore categories to model training categories."""
    mapping = {
        "Grains": "Grain",
        "Grain": "Grain",
        "FMCG": "FMCG",
        "Construction": "Construction",
        "Electronics": "Electronics",
        "General": "FMCG",
        "Dairy": "FMCG",
        "Spices": "FMCG",
    }
    return mapping.get(category, "FMCG")


def _severity_to_color(urgency: str) -> str:
    """Map urgency level to card status color."""
    if urgency == "High":
        return "red"
    elif urgency == "Medium":
        return "orange"
    return "green"


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/status")
async def model_status():
    """Check ML model loading status."""
    return get_model_status()


@router.get("/insights")
async def get_market_insights():
    """Return top-level narrative insights based on live inventory stats."""
    items = await _get_inventory_items()
    if not items:
        return {
            "market_efficiency_score": 50,
            "efficiency_label": "No active data",
            "top_insights": []
        }

    # Gather all recent orders to compute global trends
    all_7d = 0
    all_30d = 0
    high_urgency_count = 0
    total_value = 0

    for item in items:
        stock = float(item.get("current_stock", 0) or 0)
        threshold = float(item.get("threshold", 0) or 0)
        price = float(item.get("unit_price", 100)) # assume default 100 if missing
        total_value += stock * price
        
        # Calculate roughly who is high risk without full ML
        if stock <= threshold:
            high_urgency_count += 1
            
        pid = str(item.get("id", ""))
        pname = item.get("product_name", "")
        # Note: In production this would be a single heavy aggregate query,
        # but for demo scale we can reuse the helper.
        orders = await _get_order_history_for_item(pid, pname)
        stats = _compute_demand_stats(orders, stock)
        
        all_7d += stats["avg_daily_sales_7d"]
        all_30d += stats["avg_daily_sales_30d"]

    # Global growth
    global_growth = ((all_7d - all_30d) / all_30d) if all_30d > 0 else 0.0

    # Score: Penalty for high urgency items, bonus for positive growth
    score = 85
    score -= min(30, high_urgency_count * 2)
    score += min(15, int(global_growth * 100))
    efficiency = max(0, min(100, int(score)))

    insights = []
    
    # Insight 1: Demand Trend
    if global_growth > 0.03:
        insights.append({
            "type": "Demand Surge",
            "title": f"Global demand ↑ {global_growth*100:.1f}%",
            "subtitle": "Market activity increasing across categories",
            "highlight": f"+{global_growth*100:.0f}%",
            "icon_key": "trend_up"
        })
    elif global_growth < -0.03:
        insights.append({
            "type": "Demand Slowdown",
            "title": f"Market cooling ↓ {abs(global_growth)*100:.1f}%",
            "subtitle": "Overall sales volume has decreased",
            "highlight": f"-{abs(global_growth)*100:.0f}%",
            "icon_key": "trend_down"
        })
    else:
         insights.append({
            "type": "Stable Demand",
            "title": "Consistent market volume",
            "subtitle": "No major fluctuations detected globally",
            "highlight": "0%",
            "icon_key": "trend_up"
        })

    # Insight 2: Risk Warning
    if high_urgency_count > 0:
        insights.append({
            "type": "Stockout Risk",
            "title": f"{high_urgency_count} items hit threshold",
            "subtitle": "Immediate reorder recommended to prevent stockouts",
            "highlight": str(high_urgency_count),
            "icon_key": "alert"
        })
    else:
        insights.append({
            "type": "Healthy Inventory",
            "title": "Zero critical shortages",
            "subtitle": "Stock levels well-maintained across the board",
            "highlight": "GOOD",
            "icon_key": "check"
        })

    # Insight 3: Financials
    savings = round(high_urgency_count * 450) # Simulated logistics savings of bulk ordering
    insights.append({
        "type": "AI Optimization",
        "title": "Bulk-order now for logistics discount",
        "subtitle": "Consolidating reorders can waive rush fees",
        "highlight": f"₹{savings}",
        "icon_key": "bulb"
    })

    return {
        "market_efficiency_score": efficiency,
        "efficiency_label": "Operating efficiently" if efficiency > 75 else "Requires attention",
        "top_insights": insights
    }


@router.get("/alerts")
async def get_stockout_alerts(
    limit: int = Query(default=20, le=50),
    urgency: Optional[str] = Query(default=None, description="Filter: High | Medium | Low"),
):
    """
    Run ML inference on all inventory items and return stockout alerts,
    sorted by urgency (High first).
    """
    items = await _get_inventory_items()

    if not items:
        # Return demo data so frontend always has something to render
        return _demo_alerts()

    results = []
    for item in items:
        try:
            product_id = str(item.get("id", ""))
            product_name = item.get("product_name", "Unknown")
            category_raw = item.get("category", "General")
            category = _map_category(category_raw)
            current_stock = float(item.get("current_stock", 0) or 0)
            threshold = float(item.get("threshold", 0) or 0)
            unit = item.get("unit", "units")

            # Get order history for real demand stats
            orders = await _get_order_history_for_item(product_id, product_name)
            demand_stats = _compute_demand_stats(orders, current_stock)

            # Inject context-aware external variables for demonstration of AI narrative.
            # E.g., make 'Basmati Rice' or 'Wheat' have festival spikes,
            # make importing items like 'Oil' have port delays.
            p_name = product_name.lower()
            festival = 1 if ('rice' in p_name or 'wheat' in p_name or 'dal' in p_name) else 0
            port_cong = 3 if ('oil' in p_name or 'detergent' in p_name) else 0
            rain = 60.0 if ('tea' in p_name) else 0.0
            voice = 5 if ('oil' in p_name or 'rice' in p_name) else 0

            prediction = predict_stockout(
                product_name=product_name,
                category=category,
                current_stock=current_stock,
                avg_daily_sales_7d=demand_stats["avg_daily_sales_7d"],
                avg_daily_sales_30d=demand_stats["avg_daily_sales_30d"],
                sales_yesterday=demand_stats["sales_yesterday"],
                demand_growth_pct=demand_stats["demand_growth_pct"],
                lead_time_days=3 if port_cong == 0 else 5, # adjust lead time based on port
                supplier_reliability=80.0,
                rainfall_mm=rain,
                port_congestion_level=port_cong,
                festival_flag=festival,
            )
            # Add voice signals manually since it's a UI-level addition, but let build_reason handle it.
            # Reconstruct the reason with voice_signals appended.
            if voice > 0:
                prediction["recommendation_reason"] = _build_reason(
                    product_name=product_name,
                    stockout_flag=int(prediction["stockout_predicted"]),
                    days_to_stockout=prediction["days_to_stockout_estimate"],
                    avg_daily=(demand_stats["avg_daily_sales_7d"]+demand_stats["avg_daily_sales_30d"])/2 or 1,
                    current_stock=current_stock,
                    reorder_qty=prediction["recommended_reorder_qty"],
                    demand_growth_pct=demand_stats["demand_growth_pct"],
                    lead_time_days=3 if port_cong == 0 else 5,
                    rainfall_mm=rain,
                    festival_flag=festival,
                    port_congestion_level=port_cong,
                    voice_signals=voice,
                )


            color = _severity_to_color(prediction["urgency_level"])

            results.append({
                "id": product_id,
                "product_name": product_name,
                "category": category_raw,
                "current_stock": current_stock,
                "threshold": threshold,
                "unit": unit,
                "stockout_predicted": prediction["stockout_predicted"],
                "confidence": prediction["confidence"],
                "confidence_pct": round(prediction["confidence"] * 100, 1),
                "recommended_reorder_qty": prediction["recommended_reorder_qty"],
                "urgency_level": prediction["urgency_level"],
                "days_to_stockout_estimate": prediction["days_to_stockout_estimate"],
                "recommendation_reason": prediction.get("recommendation_reason", ""),
                "color": color,
                "model_source": prediction["model_source"],
                "demand_stats": demand_stats,
                "action_status": "pending",
                "generated_at": datetime.utcnow().isoformat(),
            })

        except Exception as exc:
            logger.warning("Failed prediction for item %s: %s", item.get("product_name"), exc)
            continue

    # Sort: High > Medium > Low, then by days_to_stockout ascending
    priority = {"High": 0, "Medium": 1, "Low": 2}
    results.sort(key=lambda x: (priority.get(x["urgency_level"], 3), x["days_to_stockout_estimate"]))

    if urgency:
        results = [r for r in results if r["urgency_level"].lower() == urgency.lower()]

    return results[:limit]


@router.get("/alerts/{item_id}")
async def get_item_alert(item_id: str):
    """Get detailed prediction for a single inventory item."""
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=503, detail="Firestore not available")

    doc = await firestore_service.db.collection("inventory").document(item_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")

    item = doc.to_dict()
    item["id"] = doc.id

    product_name = item.get("product_name", "Unknown")
    category = _map_category(item.get("category", "General"))
    current_stock = float(item.get("current_stock", 0) or 0)
    unit = item.get("unit", "units")

    orders = await _get_order_history_for_item(item_id, product_name)
    demand_stats = _compute_demand_stats(orders, current_stock)

    prediction = predict_stockout(
        product_name=product_name,
        category=category,
        current_stock=current_stock,
        avg_daily_sales_7d=demand_stats["avg_daily_sales_7d"],
        avg_daily_sales_30d=demand_stats["avg_daily_sales_30d"],
        sales_yesterday=demand_stats["sales_yesterday"],
        demand_growth_pct=demand_stats["demand_growth_pct"],
        lead_time_days=3,
        supplier_reliability=80.0,
    )

    # 7-day forecast
    forecast = generate_demand_forecast(
        product_name=product_name,
        avg_daily_sales_7d=demand_stats["avg_daily_sales_7d"],
        avg_daily_sales_30d=demand_stats["avg_daily_sales_30d"],
        demand_growth_pct=demand_stats["demand_growth_pct"],
    )

    color = _severity_to_color(prediction["urgency_level"])

    return {
        "id": item_id,
        "product_name": product_name,
        "category": item.get("category"),
        "current_stock": current_stock,
        "unit": unit,
        "prediction": prediction,
        "demand_stats": demand_stats,
        "demand_forecast": forecast,
        "color": color,
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.get("/demand-chart")
async def get_demand_chart(
    product_id: Optional[str] = Query(default=None),
    limit: int = Query(default=5),
):
    """
    Get 7-day demand forecasts for top N inventory items.
    Returns list of {product_name, forecast: [...]} objects.
    """
    items = await _get_inventory_items()

    if not items:
        return _demo_chart_data()

    # If specific item requested, filter
    if product_id:
        items = [i for i in items if str(i.get("id")) == product_id]

    results = []
    for item in items[:limit]:
        product_name = item.get("product_name", "Unknown")
        current_stock = float(item.get("current_stock", 0) or 0)

        orders = await _get_order_history_for_item(str(item.get("id", "")), product_name)
        demand_stats = _compute_demand_stats(orders, current_stock)

        forecast = generate_demand_forecast(
            product_name=product_name,
            avg_daily_sales_7d=demand_stats["avg_daily_sales_7d"],
            avg_daily_sales_30d=demand_stats["avg_daily_sales_30d"],
            demand_growth_pct=demand_stats["demand_growth_pct"],
        )

        # Compute urgency quickly for chart colouring
        days_remain = int(current_stock / max(demand_stats["avg_daily_sales_7d"], 0.1))
        if days_remain <= 3:
            urgency = "High"
        elif days_remain <= 10:
            urgency = "Medium"
        else:
            urgency = "Low"

        results.append({
            "product_id": str(item.get("id", "")),
            "product_name": product_name,
            "category": item.get("category", "General"),
            "current_stock": current_stock,
            "threshold": float(item.get("threshold", 0) or 0),
            "unit": item.get("unit", "units"),
            "avg_daily_demand": demand_stats["avg_daily_sales_7d"],
            "demand_growth_pct": demand_stats["demand_growth_pct"],
            "days_remaining": min(days_remain, 999),
            "urgency_level": urgency,
            "orders_count": demand_stats["orders_count"],
            "forecast": forecast,
        })

    return results


@router.post("/actions")
async def create_reorder_action(data: dict):
    """
    Record a human-in-loop action for a stockout alert.
    action_type: approve | edit | ignore
    """
    action_id = str(uuid.uuid4())
    action_type = data.get("action_type", "approve")
    item_id = data.get("item_id", "")
    product_name = data.get("product_name", "")
    approved_qty = int(data.get("approved_qty", data.get("recommended_qty", 0)))
    note = data.get("note", "")

    if action_type not in ("approve", "edit", "ignore"):
        raise HTTPException(status_code=400, detail="action_type must be approve | edit | ignore")

    action = {
        "id": action_id,
        "item_id": item_id,
        "product_name": product_name,
        "action_type": action_type,
        "approved_qty": approved_qty if action_type != "ignore" else 0,
        "note": note,
        "status": "completed" if action_type == "ignore" else "pending_reorder",
        "created_at": datetime.utcnow().isoformat(),
    }

    if firestore_service.is_enabled:
        try:
            await firestore_service.db.collection("reorder_actions").document(action_id).set(action)
        except Exception as exc:
            logger.warning("Failed to persist action: %s", exc)

    return {"status": "success", "action": action}


@router.get("/actions")
async def list_reorder_actions(
    status: Optional[str] = Query(default=None),
    limit: int = Query(default=20),
):
    """List all human-in-loop reorder actions."""
    if not firestore_service.is_enabled:
        return []

    try:
        query = firestore_service.db.collection("reorder_actions").limit(limit)
        docs = query.stream()
        actions = []
        async for doc in docs:
            a = doc.to_dict()
            a["id"] = doc.id
            actions.append(a)

        if status:
            actions = [a for a in actions if a.get("status") == status]

        actions.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        return actions[:limit]
    except Exception as exc:
        logger.warning("Failed to list actions: %s", exc)
        return []


# ─── Demo Data (when DB is empty) ─────────────────────────────────────────────

def _demo_alerts() -> list[dict]:
    now = datetime.utcnow().isoformat()
    return [
        {
            "id": "demo-1",
            "product_name": "Rice",
            "category": "Grain",
            "current_stock": 45,
            "threshold": 100,
            "unit": "kg",
            "stockout_predicted": True,
            "confidence": 0.74,
            "confidence_pct": 74.0,
            "recommended_reorder_qty": 500,
            "urgency_level": "High",
            "days_to_stockout_estimate": 2,
            "color": "red",
            "model_source": "demo",
            "recommendation_reason": "Current stock will last only ~2 days at current sales pace (22.0 units/day). With a 3-day supplier lead time, ordering must happen now to avoid a gap. Recommended order of 500 units covers roughly 22 days of stock.",
            "demand_stats": {"avg_daily_sales_7d": 22, "orders_count": 0},
            "action_status": "pending",
            "generated_at": now,
        },
        {
            "id": "demo-2",
            "product_name": "Wheat",
            "category": "Grain",
            "current_stock": 120,
            "threshold": 150,
            "unit": "kg",
            "stockout_predicted": False,
            "confidence": 0.52,
            "confidence_pct": 52.0,
            "recommended_reorder_qty": 200,
            "urgency_level": "Medium",
            "days_to_stockout_estimate": 6,
            "color": "orange",
            "model_source": "demo",
            "recommendation_reason": "At the current burn rate of 18.0 units/day, stock will run out in ~6 days. Recommended order of 200 units covers roughly 11 days of stock.",
            "demand_stats": {"avg_daily_sales_7d": 18, "orders_count": 0},
            "action_status": "pending",
            "generated_at": now,
        },
        {
            "id": "demo-3",
            "product_name": "Biscuits",
            "category": "FMCG",
            "current_stock": 500,
            "threshold": 100,
            "unit": "packets",
            "stockout_predicted": False,
            "confidence": 0.18,
            "confidence_pct": 18.0,
            "recommended_reorder_qty": 0,
            "urgency_level": "Low",
            "days_to_stockout_estimate": 25,
            "color": "green",
            "model_source": "demo",
            "recommendation_reason": "Stock is sufficient for approximately 25 days at current demand. No reorder needed at this time — maintain current stock levels.",
            "demand_stats": {"avg_daily_sales_7d": 20, "orders_count": 0},
            "action_status": "pending",
            "generated_at": now,
        },
    ]


def _demo_chart_data() -> list[dict]:
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    products = [
        ("Rice", 22, 0.05),
        ("Wheat", 18, -0.02),
        ("Biscuits", 20, 0.08),
    ]
    results = []
    for name, base, growth in products:
        forecast = []
        for i in range(1, 8):
            predicted = base * (1 + growth * i / 30)
            std = base * 0.15
            date = (now + timedelta(days=i)).strftime("%Y-%m-%d")
            day = (now + timedelta(days=i)).strftime("%a %d")
            forecast.append({
                "date": date,
                "day": day,
                "predicted_demand": round(predicted, 1),
                "lower_bound": round(max(0, predicted - std * 1.5), 1),
                "upper_bound": round(predicted + std * 1.5, 1),
            })
        results.append({
            "product_id": f"demo-{name.lower()}",
            "product_name": name,
            "category": "Grain",
            "current_stock": 200,
            "unit": "kg",
            "avg_daily_demand": base,
            "demand_growth_pct": growth,
            "forecast": forecast,
        })
    return results
