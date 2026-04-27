import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from app.services.firestore_service import firestore_service
from app.services.ml_pipeline import predict_stockout

async def test_hypo():
    # Test with 25% growth (current fallback)
    p1 = predict_stockout(
        product_name="Chana Dal",
        category="FMCG",
        current_stock=850.0,
        avg_daily_sales_7d=42.5,  # 5%
        avg_daily_sales_30d=34.0, # 4%
        sales_yesterday=42.5,
        demand_growth_pct=0.25    # 25% growth
    )
    print(f"With 25% growth | Urgency: {p1['urgency_level']} | Prob: {p1['confidence']}")

    # Test with 0% growth
    p2 = predict_stockout(
        product_name="Chana Dal",
        category="FMCG",
        current_stock=850.0,
        avg_daily_sales_7d=8.5,  # 1%
        avg_daily_sales_30d=8.5, # 1%
        sales_yesterday=8.5,
        demand_growth_pct=0.0     # 0% growth
    )
    print(f"With 0% growth | Urgency: {p2['urgency_level']} | Prob: {p2['confidence']}")

if __name__ == "__main__":
    asyncio.run(test_hypo())
