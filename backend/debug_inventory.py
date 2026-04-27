import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from app.services.firestore_service import firestore_service
from app.services.ml_pipeline import predict_stockout
from app.api.forecasting import _compute_demand_stats, _get_order_history_for_item, _map_category

async def debug_predictions():
    if not firestore_service.is_enabled:
        print("Firestore not enabled")
        return

    docs = firestore_service.db.collection("inventory").stream()
    items = []
    async for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        items.append(d)

    print(f"Total inventory items: {len(items)}")

    for item in items:
        product_id = item.get("id")
        product_name = item.get("product_name")
        category_raw = item.get("category", "General")
        category = _map_category(category_raw)
        current_stock = float(item.get("current_stock", 0))
        threshold = float(item.get("threshold", 0))

        orders = await _get_order_history_for_item(product_id, product_name)
        stats = _compute_demand_stats(orders, current_stock)

        prediction = predict_stockout(
            product_name=product_name,
            category=category,
            current_stock=current_stock,
            avg_daily_sales_7d=stats["avg_daily_sales_7d"],
            avg_daily_sales_30d=stats["avg_daily_sales_30d"],
            sales_yesterday=stats["sales_yesterday"],
            demand_growth_pct=stats["demand_growth_pct"]
        )

        print(f"Product: {product_name} | Stock: {current_stock} | Daily: {stats['avg_daily_sales_7d']} | Urgency: {prediction['urgency_level']} | Predicted Stockout: {prediction['stockout_predicted']}")

if __name__ == "__main__":
    asyncio.run(debug_predictions())
