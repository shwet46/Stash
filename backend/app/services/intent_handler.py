import uuid
import datetime
from app.services.firestore_service import firestore_service


def _inventory_payload(product: str, qty: int, entities: dict, caller: str, existing: dict | None = None) -> dict:
    now = datetime.datetime.utcnow().isoformat()
    payload = {
        "id": existing.get("id") if existing else str(uuid.uuid4()),
        "product_name": product,
        "current_stock": qty if existing is None else float(existing.get("current_stock", 0)) + qty,
        "unit": entities.get("unit") or (existing.get("unit") if existing else None) or "units",
        "threshold": float(entities.get("threshold") or (existing.get("threshold") if existing else 50) or 50),
        "category": entities.get("category") or (existing.get("category") if existing else None) or "General",
        "expiry_date": entities.get("expiry_date") or (existing.get("expiry_date") if existing else None),
        "godown_id": entities.get("godown_id") or (existing.get("godown_id") if existing else None),
        "last_updated": now,
        "updated_by": caller,
        "source": "voice",
    }
    if existing is None:
        payload["created_at"] = now
    if entities.get("lot_number"):
        payload["lot_number"] = entities.get("lot_number")
    return payload

async def handle_intent(intent: str, entities: dict, caller: str) -> dict:
    """Route intent to appropriate handler"""
    handlers = {
        "stock_arrival": handle_stock_arrival,
        "stock_query": handle_stock_query,
        "order_placed": handle_order_placed,
        "order_status": handle_order_status,
        "price_offer": handle_price_offer,
        "delivery_query": handle_delivery_query,
        "cancel_order": handle_cancel_order,
    }

    handler = handlers.get(intent, handle_unknown)
    return await handler(entities, caller)


async def handle_stock_arrival(entities: dict, caller: str) -> dict:
    """Handle stock arrival voice command"""
    product = (entities.get('product') or '').strip() or 'unknown item'
    try:
        qty = int(float(entities.get('quantity', 0) or 0))
    except (ValueError, TypeError):
        qty = 0

    normalized_product = product.lower()
    matched_item = None
    matched_id = None

    if firestore_service.is_enabled and firestore_service.db:
        docs = firestore_service.db.collection("inventory").stream()
        async for doc in docs:
            item = doc.to_dict()
            item_name = str(item.get("product_name", "")).strip().lower()
            if normalized_product and (normalized_product in item_name or item_name in normalized_product):
                matched_item = {"id": doc.id, **item}
                matched_id = doc.id
                break
        
        payload = _inventory_payload(product, qty, entities, caller, matched_item)
        target_id = matched_id or payload["id"]
        await firestore_service.upsert_document("inventory", target_id, payload)

    return {
        "status": "success",
        "message": f"Stock updated: {product} +{qty} {entities.get('unit', 'units')}",
        "product": product,
        "quantity": qty,
        "inventory_item": {
            "product_name": product,
            "current_stock": qty if matched_item is None else float(matched_item.get("current_stock", 0)) + qty,
            "unit": entities.get("unit", "units"),
            "category": entities.get("category", "General"),
            "expiry_date": entities.get("expiry_date"),
        },
    }


async def handle_stock_query(entities: dict, caller: str) -> dict:
    """Handle stock query voice command"""
    return {
        "status": "success",
        "product": entities.get("product", "unknown"),
        "current_stock": 450,
        "unit": "kg",
        "threshold": 100,
    }


async def handle_order_placed(entities: dict, caller: str) -> dict:
    """Handle new order via voice"""
    return {
        "status": "success",
        "order_ref": "STH-4833",
        "product": entities.get("product"),
        "quantity": entities.get("quantity"),
    }


async def handle_order_status(entities: dict, caller: str) -> dict:
    """Handle order status query"""
    return {
        "status": "success",
        "order_ref": entities.get("order_id", "STH-4830"),
        "order_status": "dispatched",
        "eta": "tomorrow",
    }


async def handle_price_offer(entities: dict, caller: str) -> dict:
    """Handle price negotiation via voice"""
    return {
        "status": "negotiating",
        "offered_price": entities.get("price"),
        "product": entities.get("product"),
    }


async def handle_delivery_query(entities: dict, caller: str) -> dict:
    """Handle delivery status query"""
    return {
        "status": "success",
        "order_ref": entities.get("order_id"),
        "delivery_status": "in_transit",
        "eta": "2 hours",
    }


async def handle_cancel_order(entities: dict, caller: str) -> dict:
    """Handle order cancellation"""
    return {
        "status": "cancelled",
        "order_ref": entities.get("order_id"),
    }


async def handle_unknown(entities: dict, caller: str) -> dict:
    """Handle unrecognized intent"""
    return {"status": "unknown", "message": "Intent not recognized"}
