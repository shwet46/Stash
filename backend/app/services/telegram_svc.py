"""Telegram Bot API service — notifications, commands, and webhooks"""
import httpx
import logging
import re
from datetime import datetime
from urllib.parse import urlparse

from app.core.config import settings
from app.services.firestore_service import firestore_service
from app.services.ml_pipeline import predict_stockout
from app.services.gemini import extract_intent_and_entities
from app.services.intent_handler import handle_intent

TELEGRAM_API = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}"
logger = logging.getLogger(__name__)

_INVENTORY_HINTS = {
    "inventory", "stock", "stocks", "qty", "quantity", "available", "left", "how much", "balance"
}
_ALERT_HINTS = {
    "alert", "alerts", "prediction", "predictions", "stockout", "risk", "risks", "forecast", "reorder"
}


async def send_message(chat_id: int, text: str, parse_mode: str = "HTML") -> dict:
    """Send a text message to a Telegram chat"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TELEGRAM_API}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": parse_mode},
        )
    payload = response.json()
    if not payload.get("ok"):
        raise RuntimeError(payload.get("description", "Telegram API error"))
    return payload


async def send_document(chat_id: int, document_url: str, caption: str = "") -> dict:
    """Send a document (e.g. invoice PDF) to a Telegram chat"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TELEGRAM_API}/sendDocument",
            json={
                "chat_id": chat_id,
                "document": document_url,
                "caption": caption,
            },
        )
    payload = response.json()
    if not payload.get("ok"):
        raise RuntimeError(payload.get("description", "Telegram API error"))
    return payload


def _to_float(value, default: float = 0.0) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return default


def _normalize_query_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def _extract_inventory_search_term(text: str) -> str | None:
    normalized = _normalize_query_text(text)
    if not normalized:
        return None

    cleaned = re.sub(r"^/inventory", "", normalized).strip()
    if cleaned and cleaned != normalized:
        return cleaned

    m = re.search(r"(?:stock|inventory|quantity|qty)\s+(?:of\s+)?([a-z0-9\s\-]{2,})", normalized)
    if m:
        candidate = m.group(1).strip(" .?!")
        if candidate:
            return candidate

    return None


def _looks_like_inventory_query(text: str) -> bool:
    normalized = _normalize_query_text(text)
    if normalized.startswith("/inventory"):
        return True
    return any(hint in normalized for hint in _INVENTORY_HINTS)


def _looks_like_alert_query(text: str) -> bool:
    normalized = _normalize_query_text(text)
    if normalized.startswith("/alerts"):
        return True
    return any(hint in normalized for hint in _ALERT_HINTS)

def _looks_like_stock_add_query(text: str) -> bool:
    normalized = _normalize_query_text(text)
    if not normalized:
        return False

    add_hints = (
        "add",
        "added",
        "receive",
        "received",
        "got",
        "arrived",
        "stock arrived",
        "new stock",
        "restock",
        "update inventory",
        "inventory update",
        "put",
        "put in",
    )
    inventory_hints = (
        "inventory",
        "stock",
        "stocks",
        "warehouse",
        "godown",
        "item",
        "items",
        "product",
        "products",
    )

    if any(hint in normalized for hint in add_hints) and any(hint in normalized for hint in inventory_hints):
        return True

    # If message contains a quantity (e.g. "2kg") and an add-like verb, treat as stock addition
    if re.search(r"\d+(?:\.\d+)?\s*(kg|kgs|g|ltr|l|pcs|units|bgs|bags)?", normalized) and any(hint in normalized for hint in add_hints):
        return True

    return normalized.startswith("add ") or normalized.startswith("received ") or normalized.startswith("restock ") or normalized.startswith("we received")


def _parse_stock_text(text: str) -> dict:
    """Best-effort parse of stock arrival text.
    Returns keys: product, quantity, unit, expiry_date, supplier
    expiry_date is ISO YYYY-MM-DD when parsable.
    """
    parsed: dict = {}
    if not text:
        return parsed

    normalized = text.strip()

    # Quantity + unit (e.g. 2kg, 2 kg, 2 kg sugar)
    m = re.search(r"(\d+(?:\.\d+)?)\s*(kg|kgs|g|ltr|l|pcs|units|kg\.|kg|bgs|bags)?", normalized, re.IGNORECASE)
    if m:
        try:
            parsed["quantity"] = float(m.group(1))
        except Exception:
            parsed["quantity"] = None
        unit = (m.group(2) or "").lower()
        if unit:
            # normalize some common units
            if unit in ("kgs", "kg."):
                unit = "kg"
            if unit in ("l", "ltr"):
                unit = "ltr"
            parsed["unit"] = unit

    # Expiry date patterns (YYYY-MM-DD, Dec 31 2026, 31 Dec 2026)
    date_match = None
    # ISO
    m_iso = re.search(r"(\d{4}-\d{2}-\d{2})", normalized)
    if m_iso:
        date_match = m_iso.group(1)
    else:
        # e.g. Dec 31 2026 or 31 Dec 2026
        m_nice = re.search(r"([A-Za-z]{3,9}\s+\d{1,2}\s+\d{4})", normalized)
        if m_nice:
            date_match = m_nice.group(1)
        else:
            m_alt = re.search(r"(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})", normalized)
            if m_alt:
                date_match = m_alt.group(1)

    if date_match:
        for fmt in ("%Y-%m-%d", "%b %d %Y", "%B %d %Y", "%d %b %Y", "%d %B %Y"):
            try:
                dt = datetime.strptime(date_match, fmt)
                parsed["expiry_date"] = dt.date().isoformat()
                break
            except Exception:
                continue

    # Supplier hint
    m_sup = re.search(r"from\s+([A-Za-z0-9 &.-]{2,40})", normalized, re.IGNORECASE)
    if m_sup:
        parsed["supplier"] = m_sup.group(1).strip()

    # Product: try to find word after quantity or after keywords like 'received' / 'we received'
    prod = None
    if "quantity" in parsed or "quantity" in parsed:
        # try product after quantity match
        if m:
            rest = normalized[m.end():].strip()
            # stop at 'with' or 'from' or 'expiry'
            rest = re.split(r"\bwith\b|\bfrom\b|\bexpiry|\bon\b", rest, flags=re.IGNORECASE)[0].strip()
            if rest:
                prod = rest
    if not prod:
        # fallback: remove common prefixes
        cleaned = re.sub(r"^(we\s+)?(received|got|added|add|restock)\b", "", normalized, flags=re.IGNORECASE).strip()
        cleaned = re.split(r"\bfrom\b|\bwith\b|\bexpiry|\bon\b", cleaned, flags=re.IGNORECASE)[0].strip()
        if cleaned:
            prod = cleaned

    if prod:
        # take first few words as product
        prod_words = prod.split()
        parsed["product"] = " ".join(prod_words[:4]).strip().strip(".,")

    return parsed


def _looks_like_delivery_query(text: str) -> bool:
    normalized = _normalize_query_text(text)
    if not normalized:
        return False
    if normalized.startswith("/deliveries") or "delivery" in normalized or "deliveries" in normalized:
        return True
    return False

def _looks_like_order_analytics_query(text: str) -> bool:
    normalized = _normalize_query_text(text)
    if not normalized:
        return False

    analytics_hints = (
        "analytics",
        "analysis",
        "analytics report",
        "dashboard",
        "summary",
        "stats",
        "metrics",
        "report",
        "performance",
        "trend",
        "trends",
        "revenue",
        "sales",
    )
    order_hints = (
        "order",
        "orders",
        "booking",
        "bookings",
        "dispatch",
        "delivery",
        "payment",
    )

    if any(hint in normalized for hint in analytics_hints) and any(hint in normalized for hint in order_hints):
        return True

    return normalized in {
        "tell me order analytics",
        "order analytics",
        "show me order analytics",
        "give me order analytics",
        "how are orders doing",
        "how are my orders doing",
    }


def _prediction_priority(urgency: str) -> int:
    return {"high": 0, "medium": 1, "low": 2}.get((urgency or "").lower(), 3)


def _map_category_for_prediction(raw: str | None) -> str:
    value = (raw or "general").strip().lower()
    mapping = {
        "grain": "Grain",
        "grains": "Grain",
        "rice": "Grain",
        "wheat": "Grain",
        "fmcg": "FMCG",
        "construction": "Construction",
        "electronics": "Electronics",
    }
    return mapping.get(value, "FMCG")


def _estimate_demand_features(item: dict) -> tuple[float, float, float, float]:
    stock = _to_float(item.get("current_stock"), 0.0)
    threshold = max(_to_float(item.get("threshold"), 10.0), 1.0)

    avg_30 = max(threshold / 10.0, 0.5)
    pressure = max((threshold - stock) / threshold, 0.0)
    avg_7 = max(avg_30 * (1.0 + pressure), 0.5)
    sales_yesterday = max(avg_7 * 0.9, 0.1)
    demand_growth = (avg_7 - avg_30) / avg_30 if avg_30 > 0 else 0.0
    return avg_7, avg_30, sales_yesterday, demand_growth


async def _fetch_inventory_items(search_term: str | None = None, limit: int = 8) -> list[dict]:
    if not firestore_service.is_enabled or not firestore_service.db:
        return []

    docs = firestore_service.db.collection("inventory").stream()
    items: list[dict] = []
    search = (search_term or "").strip().lower()

    async for doc in docs:
        item = doc.to_dict() or {}
        product_name = str(item.get("product_name", "")).strip()
        if not product_name:
            continue
        if search and search not in product_name.lower():
            continue

        stock = _to_float(item.get("current_stock"), 0.0)
        threshold = _to_float(item.get("threshold"), 0.0)
        if stock < threshold * 0.5:
            status = "critical"
        elif stock < threshold:
            status = "low"
        else:
            status = "healthy"

        item["id"] = doc.id
        item["status"] = status
        items.append(item)

    items.sort(key=lambda x: (_prediction_priority(x.get("status", "")), str(x.get("product_name", "")).lower()))
    return items[:limit]


def _format_inventory_reply(items: list[dict], search_term: str | None) -> str:
    if not items:
        if search_term:
            return f"I couldn\'t find any inventory for '{search_term}'. Try asking in a different way or ask for the full stock picture."
        return "I don\'t have any stock records yet, so I can\'t show inventory right now."

    title = "<b>Here\'s your inventory snapshot</b>"
    if search_term:
        title = f"<b>Here\'s the inventory for '{search_term}'</b>"

    lines = [title, ""]
    for item in items:
        unit = item.get("unit", "units")
        lines.append(
            f"- <b>{item.get('product_name', 'Unknown')}</b>: { _to_float(item.get('current_stock'), 0):g} {unit}"
            f" (threshold { _to_float(item.get('threshold'), 0):g}, status {item.get('status', 'healthy')})"
        )

    lines.append("")
    lines.append("You can ask me things like 'how much rice is left' or 'show me low stock items'.")
    return "\n".join(lines)

async def _handle_stock_addition(chat_id: int, text: str) -> None:
    try:
        # First try NLP extraction
        result = {}
        try:
            result = await extract_intent_and_entities(text)
        except Exception:
            result = {"intent": "stock_arrival", "entities": {}}

        intent = result.get("intent", "stock_arrival")
        entities = result.get("entities", {}) or {}

        # Best-effort local parse to fill missing fields (quantity, unit, product, expiry_date, supplier)
        parsed = _parse_stock_text(text)
        for k in ("product", "quantity", "unit", "expiry_date", "supplier"):
            if parsed.get(k) and not entities.get(k):
                entities[k] = parsed[k]

        # Coerce quantity to numeric if it looks like '2kg' or '2 kg' or '2.5kg'
        q = entities.get("quantity")
        if isinstance(q, str):
            m_q = re.search(r"(\d+(?:\.\d+)?)", q)
            if m_q:
                try:
                    entities["quantity"] = float(m_q.group(1))
                except Exception:
                    entities["quantity"] = None
            else:
                entities["quantity"] = None

        # Normalize common unit strings
        u = entities.get("unit")
        if isinstance(u, str):
            uu = u.lower().strip().rstrip(".")
            if uu in ("kgs", "kg"):
                entities["unit"] = "kg"
            elif uu in ("ltr", "l"):
                entities["unit"] = "ltr"
            else:
                entities["unit"] = uu

        if intent != "stock_arrival":
            intent = "stock_arrival"

        action_result = await handle_intent(intent, entities, str(chat_id))
        inventory_item = action_result.get("inventory_item", {})
        product_name = (
            inventory_item.get("product_name")
            or action_result.get("product")
            or entities.get("product")
            or parsed.get("product")
            or "the item"
        )
        current_stock = inventory_item.get("current_stock")
        unit = inventory_item.get("unit") or entities.get("unit") or parsed.get("unit") or "units"

        qty_reported = action_result.get("quantity", entities.get("quantity", parsed.get("quantity", 0)))

        if current_stock is not None:
            reply = (
                f"<b>Done</b>\n\n"
                f"I\'ve added <b>{qty_reported}</b> {unit} of <b>{product_name}</b> to inventory.\n"
                f"The stock for this item is now <b>{current_stock}</b> {unit}."
            )
        else:
            reply = (
                f"<b>Done</b>\n\n"
                f"I\'ve added <b>{qty_reported}</b> {unit} of <b>{product_name}</b> to inventory."
            )

        await send_message(chat_id, reply)
    except Exception as exc:
        logger.warning("Failed to process inventory addition from Telegram: %s", exc)
        await send_message(
            chat_id,
            "I tried to add that item, but I couldn\'t process it cleanly. Send the item name and quantity again, like 'add 20 bags of rice'.",
        )

async def _build_order_analytics_reply() -> str:
    try:
        from app.api.dashboard import _build_admin_stats

        dashboard = await _build_admin_stats()
        stats = dashboard.get("stats", {})
        recent_orders = dashboard.get("recent_orders", [])
        recent_bills = dashboard.get("recent_bills", [])
    except Exception as exc:
        logger.warning("Failed to build order analytics summary: %s", exc)
        stats = {}
        recent_orders = []
        recent_bills = []

    total_orders = int(stats.get("total_orders") or 0)
    active_orders = int(stats.get("active_orders") or 0)
    monthly_revenue = float(stats.get("monthly_revenue") or 0)
    pending_payments = float(stats.get("pending_payments") or 0)
    low_stock_count = int(stats.get("low_stock_count") or 0)
    deliveries_in_transit = int(stats.get("deliveries_in_transit") or 0)
    voice_calls_today = int(stats.get("voice_calls_today") or 0)

    lines = ["<b>Here\'s your order picture</b>", ""]
    lines.append(
        f"You currently have <b>{total_orders}</b> total orders, with <b>{active_orders}</b> active right now."
    )
    lines.append(
        f"This month\'s revenue is about <b>₹{monthly_revenue:,.2f}</b>, and pending payments are <b>₹{pending_payments:,.2f}</b>."
    )
    lines.append(
        f"I also see <b>{deliveries_in_transit}</b> deliveries in transit and <b>{low_stock_count}</b> low-stock items that may need attention."
    )
    lines.append(f"Voice activity today is <b>{voice_calls_today}</b> commands processed.")

    if recent_orders:
        lines.append("")
        lines.append("Recent orders I found:")
        for order in recent_orders[:3]:
            amount = float(order.get("total_amount") or 0)
            lines.append(
                f"- <b>{order.get('order_ref', 'Unknown')}</b>: {order.get('status', 'unknown')} • ₹{amount:,.2f}"
            )

    if recent_bills:
        lines.append("")
        lines.append("Recent bills look like this:")
        for bill in recent_bills[:2]:
            total = float(bill.get("total") or 0)
            lines.append(
                f"- <b>{bill.get('bill_ref', 'Unknown')}</b>: {bill.get('status', 'unknown')} • ₹{total:,.2f}"
            )

    lines.append("")
    lines.append("If you want, I can also break this down by revenue, top products, or low-stock risk.")
    return "\n".join(lines)


async def _build_deliveries_reply(limit: int = 5) -> str:
    """Fetch recent delivery updates and summary for Telegram."""
    if not firestore_service.is_enabled or not firestore_service.db:
        return "I don\'t have delivery data available right now."

    docs = firestore_service.db.collection("delivery_updates").stream()
    deliveries = []
    async for doc in docs:
        d = doc.to_dict() or {}
        deliveries.append(d)

    if not deliveries:
        return "No delivery updates found."

    in_transit = [d for d in deliveries if d.get("status") in ("in_transit", "dispatched")]
    delivered = [d for d in deliveries if d.get("status") == "delivered"]

    lines = ["<b>Delivery Summary</b>", ""]
    lines.append(f"Active shipments: <b>{len(in_transit)}</b>")
    lines.append(f"Delivered (recent): <b>{len(delivered)}</b>")
    lines.append("")
    lines.append("Recent updates:")
    recent_sorted = sorted(deliveries, key=lambda x: x.get("updated_at") or "", reverse=True)[:limit]
    for d in recent_sorted:
        eta = d.get("eta") or "Unknown"
        note = d.get("note") or ""
        status = d.get("status") or "unknown"
        order_id = d.get("order_id") or d.get("id")
        lines.append(f"- <b>{order_id}</b>: {status} • ETA {eta} — {note}")

    return "\n".join(lines)


async def _build_prediction_alert_candidates(limit: int = 10) -> list[dict]:
    if not firestore_service.is_enabled or not firestore_service.db:
        return []

    docs = firestore_service.db.collection("inventory").stream()
    alerts: list[dict] = []

    async for doc in docs:
        item = doc.to_dict() or {}
        product_name = str(item.get("product_name", "Unknown"))
        current_stock = _to_float(item.get("current_stock"), 0.0)
        category = _map_category_for_prediction(item.get("category"))

        avg_7, avg_30, sales_yesterday, growth = _estimate_demand_features(item)
        prediction = predict_stockout(
            product_name=product_name,
            category=category,
            current_stock=current_stock,
            avg_daily_sales_7d=avg_7,
            avg_daily_sales_30d=avg_30,
            sales_yesterday=sales_yesterday,
            demand_growth_pct=growth,
            lead_time_days=3,
            supplier_reliability=80.0,
        )

        if not prediction.get("stockout_predicted") and prediction.get("urgency_level") == "Low":
            continue

        alerts.append(
            {
                "item_id": doc.id,
                "product_name": product_name,
                "current_stock": current_stock,
                "unit": item.get("unit", "units"),
                "urgency_level": prediction.get("urgency_level", "Low"),
                "days_to_stockout_estimate": int(prediction.get("days_to_stockout_estimate", 999) or 999),
                "confidence": float(prediction.get("confidence", 0.0) or 0.0),
                "recommended_reorder_qty": int(prediction.get("recommended_reorder_qty", 0) or 0),
                "reason": prediction.get("recommendation_reason", ""),
            }
        )

    alerts.sort(key=lambda a: (_prediction_priority(a.get("urgency_level", "")), a.get("days_to_stockout_estimate", 999)))
    return alerts[:limit]


def _format_prediction_alerts(alerts: list[dict]) -> str:
    if not alerts:
        return "<b>Good news</b>\n\nI don\'t see any immediate stockout risks right now."

    lines = ["<b>Here\'s what I\'m watching closely</b>", ""]
    for alert in alerts:
        lines.append(
            f"- <b>{alert['product_name']}</b>: {alert['urgency_level']} risk, "
            f"stockout in ~{alert['days_to_stockout_estimate']} day(s), "
            f"confidence {alert['confidence'] * 100:.1f}%, "
            f"reorder {alert['recommended_reorder_qty']} {alert['unit']}"
        )
    return "\n".join(lines)


async def _resolve_owner_chat_ids() -> list[int]:
    recipients: list[int] = []

    configured_chat_id = getattr(settings, "TELEGRAM_CHAT_ID", "")
    if configured_chat_id:
        try:
            recipients.append(int(configured_chat_id))
        except ValueError:
            logger.warning("Invalid TELEGRAM_CHAT_ID configured: %s", configured_chat_id)

    if firestore_service.is_enabled and firestore_service.db:
        docs = firestore_service.db.collection("users").stream()
        async for doc in docs:
            user = doc.to_dict() or {}
            role = str(user.get("role", "")).lower()
            chat_id = user.get("telegram_chat_id")
            if role in {"owner", "admin"} and chat_id:
                try:
                    recipients.append(int(chat_id))
                except (TypeError, ValueError):
                    continue

    return list(dict.fromkeys(recipients))


async def send_prediction_alerts_to_owners(limit: int = 5) -> int:
    """Push model prediction alerts to owner/admin Telegram chats."""
    if not settings.TELEGRAM_BOT_TOKEN:
        return 0

    alerts = await _build_prediction_alert_candidates(limit=limit)
    if not alerts:
        return 0

    recipients = await _resolve_owner_chat_ids()
    if not recipients:
        return 0

    delivered = 0
    signature = "|".join(
        f"{a['item_id']}:{a['urgency_level']}:{a['days_to_stockout_estimate']}:{a['recommended_reorder_qty']}"
        for a in alerts
    )

    for chat_id in recipients:
        should_send = True
        if firestore_service.is_enabled and firestore_service.db:
            state_ref = firestore_service.db.collection("telegram_prediction_alert_state").document(str(chat_id))
            state_doc = await state_ref.get()
            if state_doc.exists:
                state = state_doc.to_dict() or {}
                if state.get("signature") == signature:
                    should_send = False

        if not should_send:
            continue

        await send_message(chat_id, _format_prediction_alerts(alerts))
        delivered += 1

        if firestore_service.is_enabled and firestore_service.db:
            await firestore_service.db.collection("telegram_prediction_alert_state").document(str(chat_id)).set(
                {"signature": signature, "last_sent_at": datetime.utcnow().isoformat()},
                merge=True,
            )

    return delivered

def _phone_candidates(phone: str) -> list[str]:
    raw = (phone or "").strip()
    if not raw:
        return []

    digits = "".join(ch for ch in raw if ch.isdigit())
    candidates: list[str] = []

    if len(digits) >= 12 and digits.startswith("91"):
        local = digits[2:12]
    elif len(digits) >= 10:
        local = digits[-10:]
    else:
        local = ""

    if local:
        candidates.extend([f"+91{local}", local])

    candidates.extend([raw, digits])

    ordered_unique: list[str] = []
    for candidate in candidates:
        if candidate and candidate not in ordered_unique:
            ordered_unique.append(candidate)
    return ordered_unique


def _canonical_phone(phone: str) -> str:
    for candidate in _phone_candidates(phone):
        if candidate.startswith("+91") and len(candidate) == 13:
            return candidate
    return _phone_candidates(phone)[0] if _phone_candidates(phone) else ""


def _welcome_text() -> str:
    return (
        "<b>Welcome to Stash!</b>\n\n"
        "We're excited to have you on board. Start managing your inventory with AI-powered voice commands.\n"
        "Type /help to see what I can do."
    )


async def _find_user_doc_by_phone(phone: str):
    if not firestore_service.is_enabled or not firestore_service.db:
        return None

    for phone_candidate in _phone_candidates(phone):
        docs = (
            firestore_service.db
            .collection("users")
            .where("phone", "==", phone_candidate)
            .limit(1)
            .stream()
        )
        async for doc in docs:
            return doc
    return None


async def _link_pending_registration(phone: str, chat_id: int) -> bool:
    """Attach Telegram chat_id to an already registered user if the number exists."""
    user_doc = await _find_user_doc_by_phone(phone)
    if not user_doc:
        return False

    await firestore_service.db.collection("users").document(user_doc.id).set(
        {"telegram_chat_id": chat_id},
        merge=True,
    )
    return True


async def _save_phone_chat_link(phone: str, chat_id: int) -> None:
    canonical = _canonical_phone(phone)
    if not canonical or not firestore_service.is_enabled or not firestore_service.db:
        return

    await firestore_service.db.collection("telegram_links").document(canonical).set(
        {"phone": canonical, "chat_id": int(chat_id)},
        merge=True,
    )


async def _find_chat_id_from_phone_link(phone: str) -> int | None:
    if not firestore_service.is_enabled or not firestore_service.db:
        return None

    for phone_candidate in _phone_candidates(phone):
        doc = await firestore_service.db.collection("telegram_links").document(phone_candidate).get()
        if doc.exists:
            data = doc.to_dict() or {}
            chat_id = data.get("chat_id")
            if chat_id:
                return int(chat_id)
    return None


async def send_welcome_message(chat_id: int) -> None:
    """Send welcome message to a Telegram chat."""
    if not chat_id:
        return

    try:
        await send_message(int(chat_id), _welcome_text())
    except Exception as exc:
        logger.warning("Failed to send welcome message to chat %s: %s", chat_id, exc)


async def send_welcome_message_by_phone(phone: str) -> bool:
    """Send welcome message to the Telegram chat linked with this phone."""
    if not firestore_service.is_enabled or not firestore_service.db:
        return False

    user_doc = await _find_user_doc_by_phone(phone)
    if not user_doc:
        return False

    user = user_doc.to_dict() or {}
    chat_id = user.get("telegram_chat_id")
    if not chat_id:
        chat_id = await _find_chat_id_from_phone_link(phone)
        if chat_id:
            await firestore_service.db.collection("users").document(user_doc.id).set(
                {"telegram_chat_id": int(chat_id)},
                merge=True,
            )

    if not chat_id:
        return False

    await send_welcome_message(int(chat_id))
    return True


async def send_registration_notification(name: str, phone: str, role: str = "admin") -> bool:
    """Notify the configured admin chat about a new registration."""
    if not settings.TELEGRAM_BOT_TOKEN:
        return False

    recipients: list[int] = []
    configured_chat_id = getattr(settings, "TELEGRAM_CHAT_ID", "")
    if configured_chat_id:
        try:
            recipients.append(int(configured_chat_id))
        except ValueError:
            logger.warning("Invalid TELEGRAM_CHAT_ID configured: %s", configured_chat_id)

    if not recipients and firestore_service.is_enabled and firestore_service.db:
        try:
            docs = firestore_service.db.collection("users").stream()
            async for doc in docs:
                data = doc.to_dict() or {}
                role_value = str(data.get("role", "")).lower()
                chat_id = data.get("telegram_chat_id")
                if role_value in {"admin", "owner"} and chat_id:
                    recipients.append(int(chat_id))
        except Exception as exc:
            logger.warning("Failed to resolve Telegram registration recipients: %s", exc)

    if not recipients:
        logger.warning("No Telegram recipient configured for registration notification")
        return False

    unique_recipients = list(dict.fromkeys(recipients))

    text = (
        f"<b>New Registration — Stash</b>\n\n"
        f"Name: {name}\n"
        f"Phone: {phone}\n"
        f"Role: {role}"
    )

    delivered = False
    try:
        for recipient_chat_id in unique_recipients:
            await send_message(int(recipient_chat_id), text)
            delivered = True
        return delivered
    except Exception as exc:
        logger.warning("Failed to send registration notification to Telegram: %s", exc)
        return False

async def send_order_confirmation(buyer, order) -> None:
    """Send order confirmation notification"""
    text = (
        f"<b>Order Confirmed — Stash</b>\n\n"
        f"Order ID: <code>{order.order_ref}</code>\n"
        f"Product: {order.product.product_name}\n"
        f"Quantity: {order.quantity} {order.product.unit}\n"
        f"Amount: ₹{order.total_amount:,.2f}\n"
        f"Estimated Delivery: {order.estimated_delivery}\n\n"
        f"Track your order by calling our Stash number."
    )
    await send_message(buyer.telegram_chat_id, text)


async def send_dispatch_alert(buyer, order, eta: str) -> None:
    """Send dispatch notification with ETA"""
    text = (
        f"<b>Your order is on the way!</b>\n\n"
        f"Order: <code>{order.order_ref}</code>\n"
        f"ETA: {eta}\n\n"
        f"You'll receive another update on delivery."
    )
    await send_message(buyer.telegram_chat_id, text)


async def send_payment_reminder(
    buyer, amount: float, due_date: str, days_overdue: int
) -> None:
    """Send payment reminder via Telegram"""
    urgency = (
        "Friendly reminder"
        if days_overdue == 0
        else f"OVERDUE by {days_overdue} day(s)"
    )
    text = (
        f"<b>{urgency} — Payment Due</b>\n\n"
        f"Amount: ₹{amount:,.2f}\n"
        f"Due Date: {due_date}\n\n"
        f"Please arrange payment at your earliest convenience."
    )
    await send_message(buyer.telegram_chat_id, text)


async def send_invoice(buyer, bill, pdf_url: str) -> None:
    """Send invoice PDF via Telegram"""
    caption = (
        f"Invoice #{bill.bill_ref}\n"
        f"Amount: ₹{bill.amount:,.2f} + GST {bill.gst_rate}% = ₹{bill.total:,.2f}"
    )
    await send_document(buyer.telegram_chat_id, pdf_url, caption)


async def send_stockout_alert_to_owner(
    owner_chat_id: int,
    product: str,
    days: int,
    confidence: float,
    recommend_qty: int,
) -> None:
    """Send disruption/stockout alert to godown owner"""
    text = (
        f"<b>Disruption Alert — Stash</b>\n\n"
        f"Product: {product}\n"
        f"Predicted stockout in: <b>{days} days</b>\n"
        f"Confidence: {confidence:.0%}\n"
        f"Recommended order: {recommend_qty} units\n\n"
        f"Auto-reorder has been triggered."
    )
    await send_message(owner_chat_id, text)


async def handle_telegram_webhook(update: dict) -> None:
    """Handle incoming Telegram webhook updates"""
    message = update.get("message", {})
    chat_id = message.get("chat", {}).get("id")
    text = message.get("text", "")
    voice = message.get("voice")

    if not chat_id:
        return

    if voice:
        file_id = voice.get("file_id")
        try:
            async with httpx.AsyncClient() as client:
                file_info_resp = await client.get(f"{TELEGRAM_API}/getFile?file_id={file_id}")
                file_info = file_info_resp.json()
                if file_info.get("ok"):
                    file_path = file_info["result"]["file_path"]
                    file_resp = await client.get(f"https://api.telegram.org/file/bot{settings.TELEGRAM_BOT_TOKEN}/{file_path}")
                    voice_bytes = file_resp.content

                    from app.services.speech import stt_process, tts_process
                    from app.services.gemini import extract_intent_and_entities, generate_voice_response
                    from app.services.intent_handler import handle_intent

                    stt_result = await stt_process(voice_bytes)
                    
                    result = await extract_intent_and_entities(stt_result)
                    intent = result.get("intent", "unknown")
                    entities = result.get("entities", {})
                    language = result.get("language_detected", "hi")

                    action_result = await handle_intent(intent, entities, str(chat_id))
                    
                    response_text = await generate_voice_response(intent, action_result, language)
                    
                    response_voice_bytes = await tts_process(response_text)

                    files = {"voice": ("response.mp3", response_voice_bytes, "audio/mpeg")}
                    await client.post(
                        f"{TELEGRAM_API}/sendVoice",
                        data={"chat_id": chat_id, "caption": response_text},
                        files=files
                    )
        except Exception as e:
            print(f"[ERROR] Processing voice message: {str(e)}")
            await send_message(chat_id, "Sorry, I had trouble processing your voice message.")
        return

    if not text:
        return

    if _looks_like_order_analytics_query(text):
        await send_message(chat_id, await _build_order_analytics_reply())
        return

    if _looks_like_delivery_query(text):
        await send_message(chat_id, await _build_deliveries_reply())
        return

    if _looks_like_stock_add_query(text):
        await _handle_stock_addition(int(chat_id), text)
        return

    if text.startswith("/start"):
        phone = text.replace("/start", "").strip()
        if phone:
            linked = False
            try:
                await _save_phone_chat_link(phone, int(chat_id))
                linked = await _link_pending_registration(phone, int(chat_id))
            except Exception as exc:
                logger.warning("Failed linking Telegram chat for phone %s: %s", phone, exc)

            if linked:
                await send_message(
                    chat_id,
                    "Your account is linked successfully. Sending your welcome message now.",
                )
                await send_welcome_message(int(chat_id))
            else:
                await send_message(
                    chat_id,
                    "I couldn\'t find an account for that number yet. Finish registration first, then send your phone number again so I can link it.",
                )
        else:
            await send_message(
                chat_id,
                "Welcome to Stash. Send me your phone number so I can link this chat to your account.",
            )

    elif _looks_like_inventory_query(text):
        search_term = _extract_inventory_search_term(text)
        items = await _fetch_inventory_items(search_term=search_term, limit=8)
        await send_message(chat_id, _format_inventory_reply(items, search_term))

    elif _looks_like_alert_query(text):
        alerts = await _build_prediction_alert_candidates(limit=5)
        await send_message(chat_id, _format_prediction_alerts(alerts))

    elif text.startswith("/help"):
        await send_message(
            chat_id,
            "I can check your orders, revenue, inventory, deliveries, and low-stock alerts. Try asking me naturally, like 'tell me order analytics' or 'how much rice is left?'.",
            "I can check your orders, revenue, inventory, deliveries, low-stock alerts, and I can also add stock when you send me an update in plain language.",
        )
    else:
        await send_message(
            chat_id,
            "I can check orders, inventory, deliveries, revenue, and alerts. Ask me naturally, and I\'ll pull the relevant update for you.",
        )


async def register_telegram_webhook() -> dict:
    """Register the Telegram webhook on app startup"""
    configured_url = (settings.TELEGRAM_WEBHOOK_URL or settings.BACKEND_URL or "").rstrip("/")
    parsed = urlparse(configured_url)
    if parsed.scheme and parsed.netloc and parsed.path not in {"", "/"}:
        webhook_url = configured_url
    elif configured_url:
        webhook_url = f"{configured_url}/api/webhook/telegram"
    else:
        webhook_url = "/api/webhook/telegram"
    if webhook_url.startswith("http://localhost") or webhook_url.startswith("https://localhost") or webhook_url.startswith("http://127.0.0.1"):
        logger.warning(
            "Telegram webhook is configured with a local URL (%s). Telegram cannot reach localhost, so incoming replies will not work until you expose a public HTTPS URL.",
            webhook_url,
        )
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TELEGRAM_API}/setWebhook",
            json={"url": webhook_url},
        )
    return response.json()
