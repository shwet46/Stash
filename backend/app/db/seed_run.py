"""Script to seed PostgreSQL and mirror seed data into Firestore."""

import asyncio
import uuid
from datetime import date, datetime

from sqlalchemy import func, select, text

from app.core.security import get_password_hash
from app.db.seed import generate_seed_data
from app.db.session import async_session, engine, init_db
from app.models import Bill, Buyer, Godown, Inventory, Order, Supplier, User
from app.services.firestore_service import firestore_service


TABLES_TO_TRUNCATE = [
    "telegram_messages",
    "call_logs",
    "delivery_updates",
    "reorder_log",
    "credit_transactions",
    "bills",
    "orders",
    "inventory",
    "buyers",
    "suppliers",
    "users",
    "godowns",
]

FIRESTORE_COLLECTION_MAP = {
    "users": "users",
    "godowns": "godowns",
    "inventory": "inventory",
    "buyers": "buyers",
    "suppliers": "suppliers",
    "orders": "orders",
    "bills": "bills",
}


def datetime_from_iso(value: str | None):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def date_from_iso(value: str | None):
    if not value:
        return None
    return date.fromisoformat(value)


async def reset_postgres_tables() -> None:
    print("🌱 Ensuring tables exist...")
    await init_db()

    print("🌱 Cleaning existing records...")
    async with engine.begin() as conn:
        for table_name in TABLES_TO_TRUNCATE:
            table_exists = await conn.scalar(
                text("SELECT to_regclass(:table_name)"),
                {"table_name": f"public.{table_name}"},
            )
            if table_exists:
                await conn.execute(
                    text(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE;')
                )


async def seed_postgres(data: dict) -> None:
    print("🌱 Seeding PostgreSQL...")

    async with async_session() as session:
        print(f"  Adding {len(data['users'])} users...")
        for user in data["users"]:
            session.add(
                User(
                    id=uuid.UUID(user["id"]),
                    name=user["name"],
                    email=user.get("email"),
                    phone=user["phone"],
                    role=user["role"],
                    hashed_password=get_password_hash("password123"),
                )
            )
        await session.flush()

        print(f"  Adding {len(data['godowns'])} godowns...")
        for godown in data["godowns"]:
            session.add(
                Godown(
                    id=uuid.UUID(godown["id"]),
                    name=godown["name"],
                    owner_id=uuid.UUID(godown["owner_id"]),
                )
            )
        await session.flush()

        print(f"  Adding {len(data['inventory'])} inventory items...")
        for item in data["inventory"]:
            session.add(
                Inventory(
                    id=uuid.UUID(item["id"]),
                    product_name=item["product_name"],
                    category=item["category"],
                    current_stock=item["current_stock"],
                    threshold=item["threshold"],
                    unit=item["unit"],
                    expiry_date=date_from_iso(item["expiry_date"]),
                    godown_id=uuid.UUID(item["godown_id"]),
                )
            )
        await session.flush()

        print(f"  Adding {len(data['buyers'])} buyers...")
        for buyer in data["buyers"]:
            session.add(
                Buyer(
                    id=uuid.UUID(buyer["id"]),
                    name=buyer["name"],
                    phone=buyer["phone"],
                    telegram_chat_id=buyer["telegram_chat_id"],
                    credit_limit=buyer["credit_limit"],
                    current_balance=buyer["current_balance"],
                    credit_due_date=date_from_iso(buyer["credit_due_date"]),
                    preferred_language=buyer["preferred_language"],
                )
            )
        await session.flush()

        print(f"  Adding {len(data['suppliers'])} suppliers...")
        for supplier in data["suppliers"]:
            session.add(
                Supplier(
                    id=uuid.UUID(supplier["id"]),
                    name=supplier["name"],
                    phone=supplier["phone"],
                    telegram_chat_id=supplier["telegram_chat_id"],
                    product_id=uuid.UUID(supplier["product_id"]),
                    priority=supplier["priority"],
                    status=supplier["status"],
                    last_contacted=datetime_from_iso(supplier["last_contacted"]),
                )
            )
        await session.flush()

        print(f"  Adding {len(data['orders'])} orders...")
        for order in data["orders"]:
            session.add(
                Order(
                    id=uuid.UUID(order["id"]),
                    order_ref=order["order_ref"],
                    buyer_id=uuid.UUID(order["buyer_id"]),
                    product_id=uuid.UUID(order["product_id"]),
                    quantity=order["quantity"],
                    status=order["status"],
                    estimated_delivery=date_from_iso(order["estimated_delivery"]),
                    total_amount=order["total_amount"],
                    created_at=datetime_from_iso(order["created_at"]),
                )
            )
        await session.flush()

        print(f"  Adding {len(data['bills'])} bills...")
        for bill in data["bills"]:
            session.add(
                Bill(
                    id=uuid.UUID(bill["id"]),
                    bill_ref=bill["bill_ref"],
                    order_id=uuid.UUID(bill["order_id"]),
                    buyer_id=uuid.UUID(bill["buyer_id"]),
                    amount=bill["amount"],
                    gst_rate=bill["gst_rate"],
                    gst_amount=bill["gst_amount"],
                    total=bill["total"],
                    status=bill["status"],
                )
            )

        await session.commit()

        print("✅ PostgreSQL seed complete")
        print("📊 PostgreSQL row counts:")
        for model, label in [
            (User, "users"),
            (Godown, "godowns"),
            (Inventory, "inventory"),
            (Buyer, "buyers"),
            (Supplier, "suppliers"),
            (Order, "orders"),
            (Bill, "bills"),
        ]:
            count = await session.scalar(select(func.count()).select_from(model))
            print(f"  {label}: {count}")


async def mirror_seed_to_firestore(data: dict) -> None:
    if not firestore_service.is_enabled:
        print("⚠️ Firestore is not configured. Skipping Firestore mirror.")
        return

    print("☁️ Mirroring seed data to Firestore...")
    users_payload = [
        {
            "id": user["id"],
            "name": user["name"],
            "email": user.get("email"),
            "phone": user["phone"],
            "role": user["role"],
        }
        for user in data["users"]
    ]

    firestore_payload = dict(data)
    firestore_payload["users"] = users_payload

    for data_key, collection_name in FIRESTORE_COLLECTION_MAP.items():
        records = firestore_payload.get(data_key, [])
        mirrored_count = await firestore_service.upsert_many(collection_name, records)
        print(f"  {collection_name}: {mirrored_count} docs upserted")

    print("✅ Firestore mirror complete")


async def seed_db():
    data = generate_seed_data()
    await reset_postgres_tables()
    await seed_postgres(data)
    await mirror_seed_to_firestore(data)
    print("🎉 Seed process finished")


if __name__ == "__main__":
    asyncio.run(seed_db())
