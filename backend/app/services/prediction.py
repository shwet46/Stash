"""Prediction service — Prophet for demand forecasting, XGBoost for disruption classification"""
import numpy as np
from datetime import datetime, timedelta


async def forecast_demand(
    product_id: str,
    historical_data: list[dict],
    forecast_days: int = 14,
) -> dict:
    """Forecast demand for a product using Prophet-style time series analysis.
    
    In production, this would use Vertex AI with Prophet models.
    For now, implements a simplified moving average forecast.
    """
    if not historical_data:
        return {
            "product_id": product_id,
            "forecast": [],
            "confidence": 0.0,
            "recommended_order": 0,
        }

    # Extract daily quantities
    quantities = [d.get("quantity", 0) for d in historical_data]
    avg_daily = np.mean(quantities) if quantities else 0
    std_daily = np.std(quantities) if quantities else 0

    # Simple forecast with trend
    forecast = []
    for i in range(forecast_days):
        date = datetime.now() + timedelta(days=i + 1)
        predicted = max(0, avg_daily + np.random.normal(0, std_daily * 0.3))
        forecast.append({
            "date": date.strftime("%Y-%m-%d"),
            "predicted_demand": round(predicted),
            "lower_bound": max(0, round(predicted - std_daily)),
            "upper_bound": round(predicted + std_daily),
        })

    total_forecast = sum(f["predicted_demand"] for f in forecast)

    return {
        "product_id": product_id,
        "forecast": forecast,
        "total_predicted_demand": total_forecast,
        "confidence": min(0.95, 0.5 + len(historical_data) * 0.01),
        "recommended_order": round(total_forecast * 1.2),  # 20% buffer
    }


async def classify_disruption_risk(
    product_id: str,
    current_stock: int,
    avg_daily_demand: float,
    weather_severity: float = 0.0,
    supplier_reliability: float = 0.9,
) -> dict:
    """Classify disruption risk using XGBoost-style feature analysis.
    
    In production, this would use Vertex AI with XGBoost models.
    """
    # Days until stockout
    days_to_stockout = current_stock / avg_daily_demand if avg_daily_demand > 0 else 999

    # Risk score calculation
    stock_risk = max(0, 1 - (days_to_stockout / 14))  # High if < 14 days
    weather_risk = weather_severity
    supplier_risk = 1 - supplier_reliability

    # Weighted composite risk
    risk_score = (stock_risk * 0.5 + weather_risk * 0.3 + supplier_risk * 0.2)

    # Classify
    if risk_score >= 0.7:
        risk_level = "critical"
    elif risk_score >= 0.4:
        risk_level = "warning"
    else:
        risk_level = "low"

    return {
        "product_id": product_id,
        "risk_level": risk_level,
        "risk_score": round(risk_score, 3),
        "days_to_stockout": round(days_to_stockout),
        "factors": {
            "stock_risk": round(stock_risk, 3),
            "weather_risk": round(weather_risk, 3),
            "supplier_risk": round(supplier_risk, 3),
        },
        "recommendation": (
            f"Critical: Order immediately. Estimated stockout in {round(days_to_stockout)} days."
            if risk_level == "critical"
            else f"Warning: Monitor closely. {round(days_to_stockout)} days of stock remaining."
            if risk_level == "warning"
            else f"Low risk: {round(days_to_stockout)} days of stock available."
        ),
    }
