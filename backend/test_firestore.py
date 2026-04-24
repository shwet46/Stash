import asyncio
from app.services.firestore_service import firestore_service

async def main():
    if not firestore_service.is_enabled:
        print("Firestore not enabled")
        return
    print("Firestore enabled")

asyncio.run(main())
