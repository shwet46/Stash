"""Payment reminder worker — sends Telegram reminders for overdue payments"""
from datetime import datetime, date


async def send_payment_reminders(db):
    """Check for overdue payments and send Telegram reminders"""
    from sqlalchemy import select
    from app.models.buyers import Buyer
    from app.services.telegram_svc import send_payment_reminder

    result = await db.execute(select(Buyer))
    buyers = result.scalars().all()

    reminders_sent = 0
    today = date.today()

    for buyer in buyers:
        if (
            buyer.current_balance
            and float(buyer.current_balance) > 0
            and buyer.credit_due_date
            and buyer.telegram_chat_id
        ):
            days_overdue = (today - buyer.credit_due_date).days

            if days_overdue >= 0:  # Due today or overdue
                try:
                    await send_payment_reminder(
                        buyer,
                        float(buyer.current_balance),
                        buyer.credit_due_date.strftime("%d %B %Y"),
                        days_overdue,
                    )
                    reminders_sent += 1
                    print(
                        f"📩 Payment reminder sent to {buyer.name} "
                        f"(₹{buyer.current_balance}, {days_overdue} days overdue)"
                    )
                except Exception as e:
                    print(f"❌ Failed to send reminder to {buyer.name}: {e}")

    return reminders_sent
