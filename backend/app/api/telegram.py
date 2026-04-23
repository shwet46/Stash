"""Telegram webhook endpoint"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.telegram_svc import handle_telegram_webhook

router = APIRouter(prefix="/api/webhook", tags=["telegram"])


@router.post("/telegram")
async def telegram_webhook(update: dict, db: AsyncSession = Depends(get_db)):
    """Handle incoming Telegram webhook updates"""
    await handle_telegram_webhook(update, db)
    return {"ok": True}
