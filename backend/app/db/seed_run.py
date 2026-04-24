"""Script to seed Firestore data."""

import asyncio
from app.db.seed import generate_seed_data
from app.services.firestore_service import firestore_service

FIRESTORE_COLLECTION_MAP = {
    "users": "users",
    "godowns": "godowns",
    "inventory": "inventory",
    "buyers": "buyers",
    "suppliers": "suppliers",
    "orders": "orders",
    "bills": "bills",
}

async def seed_firestore(data: dict) -> None:
    if not firestore_service.is_enabled:
        print("⚠️ Firestore is not configured. Skipping Firestore seed.")
        return

    print("☁️ Seeding data to Firestore...")
    users_payload = [
        {
            "id": user["id"],
            "name": user["name"],
            "email": user.get("email"),
            "phone": user["phone"],
            "role": user["role"],
            # Provide empty fields that are commonly used
            "fcm_token": None, 
        }
        for user in data["users"]
    ]

    firestore_payload = dict(data)
    firestore_payload["users"] = users_payload

    for data_key, collection_name in FIRESTORE_COLLECTION_MAP.items():
        records = firestore_payload.get(data_key, [])
        mirrored_count = await firestore_service.upsert_many(collection_name, records)
        print(f"  {collection_name}: {mirrored_count} docs upserted")

    print("✅ Firestore seed complete")

async def seed_db():
    data = generate_seed_data()
    await seed_firestore(data)
    print("🎉 Seed process finished")

if __name__ == "__main__":
    asyncio.run(seed_db())
