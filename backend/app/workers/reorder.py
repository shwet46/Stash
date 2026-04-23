"""Reorder worker — automatically contacts suppliers when stock is low"""
from datetime import datetime


async def check_and_reorder(db):
    """Check inventory levels and trigger reorder for low-stock items"""
    from sqlalchemy import select
    from app.models.inventory import Inventory
    from app.models.suppliers import Supplier

    result = await db.execute(select(Inventory))
    items = result.scalars().all()

    reorder_needed = [
        item for item in items if item.current_stock < item.threshold
    ]

    for item in reorder_needed:
        # Find primary supplier
        supplier_result = await db.execute(
            select(Supplier)
            .where(Supplier.product_id == item.id)
            .where(Supplier.status == "active")
            .order_by(Supplier.priority)
        )
        supplier = supplier_result.scalars().first()

        if supplier:
            # Calculate recommended order quantity
            reorder_qty = item.threshold * 2 - item.current_stock

            # In production: trigger outbound call to supplier via Twilio
            # and send Telegram alert to owner
            print(
                f"🔄 Reorder: {item.product_name} — {reorder_qty} {item.unit} "
                f"from {supplier.name} ({supplier.phone})"
            )

            # Log the reorder attempt
            from app.models.delivery import ReorderLog
            import uuid

            log = ReorderLog(
                id=uuid.uuid4(),
                product_id=item.id,
                supplier_id=supplier.id,
                status="initiated",
                response=f"Auto-reorder: {reorder_qty} {item.unit}",
                called_at=datetime.utcnow(),
            )
            db.add(log)

    await db.commit()
    return len(reorder_needed)
