"""Script to populate the database with seed data"""
import asyncio
import uuid
from sqlalchemy import select
from app.db.session import async_session, engine, Base
from app.db.seed import generate_seed_data
from app.models import (
    User, Godown, Inventory, Buyer, Supplier, Order, Bill
)


async def seed_db():
    print("🌱 Starting database seeding...")
    data = generate_seed_data()
    
    async with async_session() as session:
        # 1. Users
        print(f"  Adding {len(data['users'])} users...")
        for u in data["users"]:
            session.add(User(**u))
        await session.flush()

        # 2. Godowns
        print(f"  Adding {len(data['godowns'])} godowns...")
        for g in data["godowns"]:
            # Handle lat/lon for PostGIS if needed, for now just basic fields
            # Godown model uses Geography(POINT), so we need a SQL expression
            # For simplicity in seed, we'll just set name and owner
            session.add(Godown(
                id=uuid.UUID(g["id"]),
                name=g["name"],
                owner_id=uuid.UUID(g["owner_id"])
            ))
        await session.flush()

        # 3. Inventory
        print(f"  Adding {len(data['inventory'])} inventory items...")
        for i in data["inventory"]:
            session.add(Inventory(
                id=uuid.UUID(i["id"]),
                product_name=i["product_name"],
                category=i["category"],
                current_stock=i["current_stock"],
                threshold=i["threshold"],
                unit=i["unit"],
                expiry_date=i["expiry_date"],
                godown_id=uuid.UUID(i["godown_id"])
            ))
        await session.flush()

        # 4. Buyers
        print(f"  Adding {len(data['buyers'])} buyers...")
        for b in data["buyers"]:
            session.add(Buyer(**b))
        await session.flush()

        # 5. Suppliers
        print(f"  Adding {len(data['suppliers'])} suppliers...")
        for s in data["suppliers"]:
            session.add(Supplier(
                id=uuid.UUID(s["id"]),
                name=s["name"],
                phone=s["phone"],
                telegram_chat_id=s["telegram_chat_id"],
                product_id=uuid.UUID(s["product_id"]),
                priority=s["priority"],
                status=s["status"],
                last_contacted=datetime_from_iso(s["last_contacted"])
            ))
        await session.flush()

        # 6. Orders
        print(f"  Adding {len(data['orders'])} orders...")
        for o in data["orders"]:
            session.add(Order(
                id=uuid.UUID(o["id"]),
                order_ref=o["order_ref"],
                buyer_id=uuid.UUID(o["buyer_id"]),
                product_id=uuid.UUID(o["product_id"]),
                quantity=o["quantity"],
                status=o["status"],
                estimated_delivery=o["estimated_delivery"],
                total_amount=o["total_amount"],
                created_at=datetime_from_iso(o["created_at"])
            ))
        await session.flush()

        # 7. Bills
        print(f"  Adding {len(data['bills'])} bills...")
        for b in data["bills"]:
            session.add(Bill(
                id=uuid.UUID(b["id"]),
                bill_ref=b["bill_ref"],
                order_id=uuid.UUID(b["order_id"]),
                buyer_id=uuid.UUID(b["buyer_id"]),
                amount=b["amount"],
                gst_rate=b["gst_rate"],
                gst_amount=b["gst_amount"],
                total=b["total"],
                status=b["status"]
            ))
        
        await session.commit()
    print("✅ Seeding complete!")


def datetime_from_iso(s):
    from datetime import datetime
    if not s: return None
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


if __name__ == "__main__":
    asyncio.run(seed_db())
