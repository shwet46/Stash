"""Payment reminder worker — sends Telegram reminders for overdue payments"""
from datetime import datetime, date
from app.services.firestore_service import firestore_service


async def send_payment_reminders():
    """Check for overdue payments and send Telegram reminders"""
    from app.services.telegram_svc import send_payment_reminder

    if not firestore_service.is_enabled:
        return 0

    docs = firestore_service.db.collection("buyers").stream()
    buyers = []
    async for doc in docs:
        buyers.append(doc.to_dict())

    reminders_sent = 0
    today = date.today()

    for buyer in buyers:
        current_balance = float(buyer.get("current_balance") or 0)
        due_date_str = buyer.get("credit_due_date")
        chat_id = buyer.get("telegram_chat_id")

        if current_balance > 0 and due_date_str and chat_id:
            try:
                credit_due_date = date.fromisoformat(due_date_str)
                days_overdue = (today - credit_due_date).days

                if days_overdue >= 0:  # Due today or overdue
                    # Create a dummy object or dictionary for the telegram function
                    # if it expects object properties. Wait, telegram_svc expects buyer.telegram_chat_id
                    # Let's adjust buyer to be an object-like dictionary or we can just pass dicts.
                    # Wait, send_payment_reminder accesses buyer.telegram_chat_id! 
                    # We should make a named tuple or dict wrapper.
                    class BuyerWrapper:
                        def __init__(self, d):
                            self.__dict__.update(d)
                    
                    buyer_obj = BuyerWrapper(buyer)

                    await send_payment_reminder(
                        buyer_obj,
                        current_balance,
                        credit_due_date.strftime("%d %B %Y"),
                        days_overdue,
                    )
                    reminders_sent += 1
                    print(
                        f"📩 Payment reminder sent to {buyer.get('name')} "
                        f"(₹{current_balance}, {days_overdue} days overdue)"
                    )
            except Exception as e:
                print(f"❌ Failed to send reminder to {buyer.get('name')}: {e}")

    return reminders_sent
