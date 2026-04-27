"""APScheduler setup for background tasks"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler


scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")


async def run_reorder_check():
    """Scheduled: check inventory and trigger reorders"""
    from app.workers.reorder import check_and_reorder

    count = await check_and_reorder()
    if count:
        print(f"⏰ Reorder check: {count} items need reorder")


async def run_payment_reminders():
    """Scheduled: send payment reminders"""
    from app.workers.reminders import send_payment_reminders

    count = await send_payment_reminders()
    if count:
        print(f"⏰ Payment reminders: {count} sent")


async def run_delivery_check():
    """Scheduled: check delivery updates"""
    from app.workers.delivery import check_delivery_updates

    count = await check_delivery_updates()
    print(f"⏰ Delivery check: {count} active deliveries")


async def run_prediction_alerts():
    """Scheduled: push model prediction alerts to Telegram"""
    from app.workers.prediction_alerts import send_prediction_alerts

    count = await send_prediction_alerts()
    if count:
        print(f"⏰ Prediction alerts: sent to {count} Telegram chats")


def setup_scheduler():
    """Configure and start the scheduler"""
    # Check inventory every 30 minutes
    scheduler.add_job(run_reorder_check, "interval", minutes=30, id="reorder_check")

    # Send payment reminders at 9 AM IST daily
    scheduler.add_job(
        run_payment_reminders, "cron", hour=9, minute=0, id="payment_reminders"
    )

    # Check deliveries every 15 minutes
    scheduler.add_job(
        run_delivery_check, "interval", minutes=15, id="delivery_check"
    )

    # Send inventory risk alerts based on model predictions every hour
    scheduler.add_job(
        run_prediction_alerts, "interval", minutes=60, id="prediction_alerts"
    )

    scheduler.start()
    print("📅 Scheduler started with 4 jobs")
