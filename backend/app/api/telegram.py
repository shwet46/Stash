"""Telegram webhook endpoint"""
from fastapi import APIRouter
from app.services.telegram_svc import handle_telegram_webhook

router = APIRouter(prefix="/api/webhook", tags=["telegram"])


@router.post("/telegram")
async def telegram_webhook(update: dict):
    """Handle incoming Telegram webhook updates"""
    await handle_telegram_webhook(update)
    return {"ok": True}
