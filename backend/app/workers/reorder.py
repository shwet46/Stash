"""Reorder worker — automatically contacts suppliers when stock is low"""
from datetime import datetime
import uuid
from app.services.firestore_service import firestore_service


async def check_and_reorder():
    """Check inventory levels and trigger reorder for low-stock items"""
    if not firestore_service.is_enabled:
        return 0

    docs = firestore_service.db.collection("inventory").stream()
    items = []
    async for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        items.append(d)

    reorder_needed = [
        item for item in items 
        if float(item.get("current_stock", 0)) < float(item.get("threshold", 0))
    ]

    for item in reorder_needed:
        # Find primary supplier
        s_docs = firestore_service.db.collection("suppliers").where("product_id", "==", item["id"]).where("status", "==", "active").stream()
        suppliers = []
        async for doc in s_docs:
            d = doc.to_dict()
            d["id"] = doc.id
            suppliers.append(d)
        
        suppliers.sort(key=lambda x: x.get("priority", 1))
        supplier = suppliers[0] if suppliers else None

        if supplier:
            # Calculate recommended order quantity
            reorder_qty = float(item.get("threshold", 0)) * 2 - float(item.get("current_stock", 0))

            # In production: trigger outbound call to supplier via Twilio
            # and send Telegram alert to owner
            print(
                f"🔄 Reorder: {item.get('product_name')} — {reorder_qty} {item.get('unit')} "
                f"from {supplier.get('name')} ({supplier.get('phone')})"
            )

            # Log the reorder attempt
            log_id = str(uuid.uuid4())
            log = {
                "id": log_id,
                "product_id": item["id"],
                "supplier_id": supplier["id"],
                "status": "initiated",
                "response": f"Auto-reorder: {reorder_qty} {item.get('unit')}",
                "called_at": datetime.utcnow().isoformat(),
            }
            await firestore_service.db.collection("reorder_logs").document(log_id).set(log)

    return len(reorder_needed)
