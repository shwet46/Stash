import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from app.services.firestore_service import firestore_service
from app.services.ml_pipeline import predict_stockout

async def quick_debug():
    if not firestore_service.is_enabled:
        print("Firestore not enabled")
        return

    # Use get() instead of stream() for small sample
    docs = await firestore_service.db.collection("inventory").limit(20).get()
    
    print(f"Sample size: {len(docs)}")
    
    for doc in docs:
        item = doc.to_dict()
        name = item.get("product_name")
        stock = float(item.get("current_stock", 0))
        
        # Simulate stats since we want it FAST
        p = predict_stockout(
            product_name=name,
            category="FMCG",
            current_stock=stock,
            avg_daily_sales_7d=10.0,
            avg_daily_sales_30d=10.0,
            sales_yesterday=10.0
        )
        print(f"{name} | Stock: {stock} | Urgency: {p['urgency_level']} | Prob: {p['confidence']}")

if __name__ == "__main__":
    asyncio.run(quick_debug())
