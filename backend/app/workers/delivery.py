"""Delivery tracking worker"""
from app.services.firestore_service import firestore_service


async def check_delivery_updates():
    """Check and update delivery statuses, notify buyers"""
    if not firestore_service.is_enabled:
        return 0

    docs = firestore_service.db.collection("orders").where("status", "in", ["dispatched", "in_transit"]).stream()
    active_deliveries = []
    async for doc in docs:
        active_deliveries.append(doc.to_dict())

    for order in active_deliveries:
        # In production: check Google Maps Routes API for ETA
        # Update delivery status based on driver location
        # Send Telegram notification to buyer if status changed
        pass

    return len(active_deliveries)
