"""APScheduler setup for background tasks"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.db.session import async_session


scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")


async def run_reorder_check():
    """Scheduled: check inventory and trigger reorders"""
    from app.workers.reorder import check_and_reorder

    async with async_session() as db:
        count = await check_and_reorder(db)
        if count:
            print(f"⏰ Reorder check: {count} items need reorder")


async def run_payment_reminders():
    """Scheduled: send payment reminders"""
    from app.workers.reminders import send_payment_reminders

    async with async_session() as db:
        count = await send_payment_reminders(db)
        if count:
            print(f"⏰ Payment reminders: {count} sent")


async def run_delivery_check():
    """Scheduled: check delivery updates"""
    from app.workers.delivery import check_delivery_updates

    async with async_session() as db:
        count = await check_delivery_updates(db)
        print(f"⏰ Delivery check: {count} active deliveries")


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

    scheduler.start()
    print("📅 Scheduler started with 3 jobs")
