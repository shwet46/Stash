"""Prediction alert worker - pushes model-based stockout alerts to Telegram."""

from app.services.telegram_svc import send_prediction_alerts_to_owners


async def send_prediction_alerts() -> int:
    """Send prediction alerts to owner/admin Telegram chats."""
    return await send_prediction_alerts_to_owners(limit=5)
