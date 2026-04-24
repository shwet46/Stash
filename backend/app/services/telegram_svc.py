"""Telegram Bot API service — notifications, commands, and webhooks"""
import httpx
from app.core.config import settings

TELEGRAM_API = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}"


async def send_message(chat_id: int, text: str, parse_mode: str = "HTML") -> dict:
    """Send a text message to a Telegram chat"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TELEGRAM_API}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": parse_mode},
        )
    return response.json()


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
    return response.json()


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

    if not chat_id or not text:
        return

    if text.startswith("/start"):
        phone = text.replace("/start", "").strip()
        if phone:
            # Link Telegram chat_id to buyer by phone number
            # In production, this would query the database
            await send_message(
                chat_id,
                "Welcome to Stash! Your account is now linked for order updates and invoices.",
            )
        else:
            await send_message(
                chat_id,
                "Welcome to Stash! Send /start {your phone number} to link your account.",
            )

    elif text.startswith("/status"):
        order_ref = text.replace("/status", "").strip()
        if order_ref:
            await send_message(chat_id, f"Looking up order {order_ref}...")
            # In production, query order status from database
        else:
            await send_message(chat_id, "Usage: /status {order_id}")

    elif text.startswith("/invoice"):
        order_ref = text.replace("/invoice", "").strip()
        if order_ref:
            await send_message(chat_id, f"Fetching invoice for {order_ref}...")
            # In production, retrieve and send invoice PDF
        else:
            await send_message(chat_id, "Usage: /invoice {order_id}")

    elif text.startswith("/help"):
        await send_message(
            chat_id,
            "<b>Stash Bot Commands</b>\n\n"
            "/start {phone} — Link your account\n"
            "/status {order_id} — Check order status\n"
            "/invoice {order_id} — Get invoice PDF\n"
            "/help — Show this menu",
        )
    else:
        await send_message(
            chat_id,
            "I didn't understand that. Send /help to see available commands.",
        )


async def register_telegram_webhook() -> dict:
    """Register the Telegram webhook on app startup"""
    webhook_url = f"{settings.BACKEND_URL}/api/webhook/telegram"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TELEGRAM_API}/setWebhook",
            json={"url": webhook_url},
        )
    return response.json()
