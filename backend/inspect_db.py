import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from app.services.firestore_service import firestore_service

async def inspect():
    if not firestore_service.is_enabled:
        print("Firestore not enabled")
        return

    docs = await firestore_service.db.collection("inventory").limit(5).get()
    for doc in docs:
        d = doc.to_dict()
        print(f"Product: {d.get('product_name')} | Stock: {d.get('current_stock')} | Threshold: {d.get('threshold')}")

if __name__ == "__main__":
    asyncio.run(inspect())
