import warnings
warnings.filterwarnings("ignore")

from app.services.ml_pipeline import predict_stockout, generate_demand_forecast, get_model_status

status = get_model_status()
print("Models loaded:", status["models_loaded"])

# Test Rice low stock
r = predict_stockout("Rice", "Grain", current_stock=45, avg_daily_sales_7d=22, avg_daily_sales_30d=20, sales_yesterday=25)
print("Rice (low):", r)

# Test Wheat healthy stock
r2 = predict_stockout("Wheat", "Grain", current_stock=800, avg_daily_sales_7d=30, avg_daily_sales_30d=28, sales_yesterday=32)
print("Wheat (healthy):", r2)

# Test forecast
f = generate_demand_forecast("Rice", 22, 20, 0.05)
print("Forecast (7 days):")
for d in f:
    print(f"  {d['day']}: {d['predicted_demand']} units [{d['lower_bound']}-{d['upper_bound']}]")
