"""
ML Pipeline — Stockout Prediction & Reorder Recommendation
Uses pre-trained models: stockout_classifier.pkl, reorder_regressor.pkl, label_encoders.pkl

Exact 18 feature columns (matching training CSV):
  warehouse_id, city, product_name, category,
  current_stock, incoming_stock,
  avg_daily_sales_7d, avg_daily_sales_30d, sales_yesterday,
  demand_growth_pct, lead_time_days, supplier_reliability,
  rainfall_mm, temperature, port_congestion_level, festival_flag,
  weekday (encoded), season (encoded)

Label encoders available for: city, product_name, category, weekday, season

Targets:
  stockout_next_3_days (0/1) → stockout_classifier
  recommended_reorder_qty (int) → reorder_regressor
"""

import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

# ─── Model Registry ──────────────────────────────────────────────────────────

_MODELS_DIR = Path(__file__).resolve().parents[2] / "models"

_stockout_clf = None
_reorder_reg = None
_label_encoders: dict[str, Any] = {}
_models_loaded = False
_load_error: str | None = None

# Known training values for ordinal fallback
WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
SEASONS = ["Normal", "Summer", "Monsoon", "Winter", "Festive"]
KNOWN_CITIES = ["Ahmedabad", "Pune", "Mumbai", "Indore", "Delhi", "Nagpur"]
KNOWN_PRODUCTS = ["Rice", "Wheat", "Biscuits", "Oil", "Soap", "Cement", "Paint", "Electronics"]
KNOWN_CATEGORIES = ["Grain", "FMCG", "Construction", "Electronics"]

# Exact 18 feature columns in training order
FEATURE_COLUMNS = [
    "warehouse_id",
    "city",
    "product_name",
    "category",
    "current_stock",
    "incoming_stock",
    "avg_daily_sales_7d",
    "avg_daily_sales_30d",
    "sales_yesterday",
    "demand_growth_pct",
    "lead_time_days",
    "supplier_reliability",
    "rainfall_mm",
    "temperature",
    "port_congestion_level",
    "festival_flag",
    "weekday",
    "season",
]


def _load_models() -> None:
    """Load all pkl models at startup. Safe — logs warnings on failure."""
    global _stockout_clf, _reorder_reg, _label_encoders, _models_loaded, _load_error
    try:
        import joblib  # type: ignore

        clf_path = _MODELS_DIR / "stockout_classifier.pkl"
        reg_path = _MODELS_DIR / "reorder_regressor.pkl"
        enc_path = _MODELS_DIR / "label_encoders.pkl"

        if not (clf_path.exists() and reg_path.exists() and enc_path.exists()):
            missing = [p.name for p in [clf_path, reg_path, enc_path] if not p.exists()]
            _load_error = f"Missing model files: {missing}. Using heuristic fallback."
            logger.warning(_load_error)
            return

        _stockout_clf = joblib.load(clf_path)
        _reorder_reg = joblib.load(reg_path)
        _label_encoders = joblib.load(enc_path)
        _models_loaded = True
        logger.info("✅ ML models loaded successfully from %s", _MODELS_DIR)

    except Exception as exc:
        _load_error = str(exc)
        logger.error("Failed to load ML models: %s", exc)


# Load eagerly on import
_load_models()


# ─── Feature Engineering ─────────────────────────────────────────────────────

def _encode_categorical(value: str, encoder_key: str, known_values: list[str]) -> int:
    """Encode a categorical value using label encoder or ordinal fallback."""
    enc = _label_encoders.get(encoder_key)
    if enc is not None:
        try:
            return int(enc.transform([str(value)])[0])
        except Exception:
            pass
    # Fallback: ordinal position in known list (unknown → 0)
    try:
        return known_values.index(str(value))
    except ValueError:
        return 0


def _get_weekday() -> str:
    return datetime.utcnow().strftime("%A")


def _get_season() -> str:
    month = datetime.utcnow().month
    if month in (12, 1, 2):
        return "Winter"
    elif month in (3, 4, 5):
        return "Summer"
    elif month in (6, 7, 8, 9):
        return "Monsoon"
    else:
        return "Normal"


def _build_feature_vector(
    product_name: str,
    category: str,
    current_stock: float,
    avg_daily_7d: float,
    avg_daily_30d: float,
    sales_yesterday: float,
    demand_growth_pct: float = 0.0,
    lead_time_days: int = 3,
    supplier_reliability: float = 80.0,
    rainfall_mm: float = 0.0,
    temperature: float = 28.0,
    port_congestion_level: int = 0,
    festival_flag: int = 0,
    city: str = "Mumbai",
    warehouse_id: int = 1,
    incoming_stock: float = 0.0,
) -> np.ndarray:
    """
    Build the exact 18-column feature vector matching model training schema.

    Column order:
    warehouse_id, city, product_name, category,
    current_stock, incoming_stock,
    avg_daily_sales_7d, avg_daily_sales_30d, sales_yesterday,
    demand_growth_pct, lead_time_days, supplier_reliability,
    rainfall_mm, temperature, port_congestion_level, festival_flag,
    weekday, season
    """
    weekday = _get_weekday()
    season = _get_season()

    # Encode categoricals
    city_enc = _encode_categorical(city, "city", KNOWN_CITIES)
    product_enc = _encode_categorical(product_name, "product_name", KNOWN_PRODUCTS)
    category_enc = _encode_categorical(category, "category", KNOWN_CATEGORIES)
    weekday_enc = _encode_categorical(weekday, "weekday", WEEKDAYS)
    season_enc = _encode_categorical(season, "season", SEASONS)

    features = [
        float(warehouse_id),          # warehouse_id
        float(city_enc),              # city (encoded)
        float(product_enc),           # product_name (encoded)
        float(category_enc),          # category (encoded)
        float(current_stock),         # current_stock
        float(incoming_stock),        # incoming_stock
        float(avg_daily_7d),          # avg_daily_sales_7d
        float(avg_daily_30d),         # avg_daily_sales_30d
        float(sales_yesterday),       # sales_yesterday
        float(demand_growth_pct),     # demand_growth_pct
        float(lead_time_days),        # lead_time_days
        float(supplier_reliability),  # supplier_reliability
        float(rainfall_mm),           # rainfall_mm
        float(temperature),           # temperature
        float(port_congestion_level), # port_congestion_level
        float(festival_flag),         # festival_flag
        float(weekday_enc),           # weekday (encoded)
        float(season_enc),            # season (encoded)
    ]

    assert len(features) == 18, f"Feature count mismatch: {len(features)}"
    return np.array(features, dtype=float).reshape(1, -1)


# ─── Heuristic Fallback (when models not loaded) ─────────────────────────────

def _heuristic_prediction(
    current_stock: float,
    avg_daily: float,
    lead_time_days: int,
) -> tuple[int, float, int, str]:
    """Returns: (stockout_flag, confidence, reorder_qty, urgency_level)"""
    days_to_stockout = (current_stock / avg_daily) if avg_daily > 0 else 999
    stockout_flag = 1 if days_to_stockout <= 3 else 0

    if days_to_stockout <= 2:
        confidence = 0.92
    elif days_to_stockout <= 5:
        confidence = 0.78
    elif days_to_stockout <= 10:
        confidence = 0.65
    else:
        confidence = 0.55

    reorder_qty = max(0, round((lead_time_days + 7) * avg_daily))

    if stockout_flag == 1 or days_to_stockout <= 3:
        urgency = "High"
    elif days_to_stockout <= 7:
        urgency = "Medium"
    else:
        urgency = "Low"

    return stockout_flag, confidence, reorder_qty, urgency


# ─── Recommendation Reasoning ────────────────────────────────────────────────

def _build_reason(
    product_name: str,
    stockout_flag: int,
    days_to_stockout: int,
    avg_daily: float,
    current_stock: float,
    reorder_qty: int,
    demand_growth_pct: float,
    lead_time_days: int,
    rainfall_mm: float = 0.0,
    festival_flag: int = 0,
    port_congestion_level: int = 0,
    voice_signals: int = 0,
) -> str:
    """Generate a cohesive plain-English explanation for the reorder recommendation, integrating external disruptions."""
    parts = []

    # 1. Base consumption & stock runway
    if days_to_stockout <= 999:
        if days_to_stockout <= 2:
            parts.append(f"Current consumption velocity: {avg_daily:.1f} units/day. Remaining stock: {current_stock:.0f} units.")
            parts.append(f"At this rate — stockout predicted within {days_to_stockout} days.")
        elif days_to_stockout <= 7:
            parts.append(f"Current consumption velocity: {avg_daily:.1f} units/day.")
            parts.append(f"At this rate — stockout predicted in ~{days_to_stockout} days.")
        else:
            parts.append(f"Stock is sufficient for ~{days_to_stockout} days at current demand.")

    # 2. Demand side disruptions
    if festival_flag == 1:
        parts.append("Festival season detected: Historical data + calendar AI predicts a significant spike in demand.")
    elif demand_growth_pct > 0.05:
        parts.append(f"Recent trend: Demand has surged by {demand_growth_pct*100:.0f}% above baseline.")
    
    if voice_signals > 0:
        parts.append(f"LIVE VOICE BOT SIGNAL: {voice_signals} active inquiries for '{product_name}' detected right now. Immediate demand peak expected.")

    # 3. Supply side disruptions
    if port_congestion_level > 2 or rainfall_mm > 50:
        delay_factors = []
        if rainfall_mm > 50:
            delay_factors.append("heavy rainfall")
        if port_congestion_level > 2:
            delay_factors.append("critical port congestion")
        parts.append(f"WARNING: Incoming supply may be delayed due to {' and '.join(delay_factors)}.")
        if stockout_flag:
            parts.append(f"Standard {lead_time_days}-day lead time is compromised. Order immediately.")
    elif lead_time_days > 2 and stockout_flag:
        parts.append(f"With a {lead_time_days}-day supplier lead time, ordering must happen now to avoid a gap.")

    # 4. Action recommendation
    if reorder_qty > 0:
        parts.append(f"Recommended action: Reorder {reorder_qty} units now.")

    return " ".join(parts) if parts else "Based on current stock and sales trends."


# ─── Public API ──────────────────────────────────────────────────────────────

def get_model_status() -> dict:
    return {
        "models_loaded": _models_loaded,
        "error": _load_error,
        "models_dir": str(_MODELS_DIR),
        "feature_count": 18,
        "features": FEATURE_COLUMNS,
    }


def predict_stockout(
    product_name: str,
    category: str,
    current_stock: float,
    avg_daily_sales_7d: float,
    avg_daily_sales_30d: float,
    sales_yesterday: float,
    demand_growth_pct: float = 0.0,
    lead_time_days: int = 3,
    supplier_reliability: float = 80.0,
    rainfall_mm: float = 0.0,
    temperature: float = 28.0,
    port_congestion_level: int = 0,
    festival_flag: int = 0,
    city: str = "Mumbai",
    warehouse_id: int = 1,
    incoming_stock: float = 0.0,
) -> dict:
    """
    Run full ML inference using pre-trained stockout_classifier and reorder_regressor.

    Returns:
      - stockout_predicted (bool)
      - confidence (float 0-1)
      - recommended_reorder_qty (int)
      - urgency_level (High/Medium/Low)
      - days_to_stockout_estimate (int)
      - model_source (ml_model | heuristic | heuristic_fallback)
    """
    avg_daily = (avg_daily_sales_7d + avg_daily_sales_30d) / 2 if (avg_daily_sales_7d or avg_daily_sales_30d) else 1.0
    days_to_stockout_estimate = int(current_stock / avg_daily) if avg_daily > 0 else 999

    if not _models_loaded:
        flag, confidence, reorder_qty, urgency = _heuristic_prediction(
            current_stock, avg_daily, lead_time_days
        )
        reason = _build_reason(
            product_name=product_name,
            stockout_flag=flag,
            days_to_stockout=days_to_stockout_estimate,
            avg_daily=avg_daily,
            current_stock=current_stock,
            reorder_qty=reorder_qty,
            demand_growth_pct=demand_growth_pct,
            lead_time_days=lead_time_days,
            rainfall_mm=rainfall_mm,
            festival_flag=festival_flag,
            port_congestion_level=port_congestion_level,
        )
        return {
            "stockout_predicted": bool(flag),
            "confidence": round(confidence, 4),
            "recommended_reorder_qty": reorder_qty,
            "urgency_level": urgency,
            "days_to_stockout_estimate": min(days_to_stockout_estimate, 999),
            "recommendation_reason": reason,
            "model_source": "heuristic",
        }

    try:
        X = _build_feature_vector(
            product_name=product_name,
            category=category,
            current_stock=current_stock,
            avg_daily_7d=avg_daily_sales_7d,
            avg_daily_30d=avg_daily_sales_30d,
            sales_yesterday=sales_yesterday,
            demand_growth_pct=demand_growth_pct,
            lead_time_days=lead_time_days,
            supplier_reliability=supplier_reliability,
            rainfall_mm=rainfall_mm,
            temperature=temperature,
            port_congestion_level=port_congestion_level,
            festival_flag=festival_flag,
            city=city,
            warehouse_id=warehouse_id,
            incoming_stock=incoming_stock,
        )

        # Stockout classification
        stockout_flag = int(_stockout_clf.predict(X)[0])

        # Probability → show P(stockout=1), the actual risk score
        # Never use max(proba) — that shows certainty of the winning class,
        # which is always high even for "safe" items. We want risk probability.
        if hasattr(_stockout_clf, "predict_proba"):
            proba = _stockout_clf.predict_proba(X)[0]
            classes = list(_stockout_clf.classes_)
            if 1 in classes:
                stockout_prob = float(proba[classes.index(1)])
            else:
                stockout_prob = float(proba[-1])
            # Apply mild calibration cap — ML models tend to be overconfident
            # on narrow training sets. Cap at 0.88 to stay realistic.
            confidence = min(stockout_prob, 0.88)
        else:
            confidence = 0.72 if stockout_flag else 0.45

        # Reorder regression
        reorder_qty = max(0, int(round(float(_reorder_reg.predict(X)[0]))))

        # Urgency: Use ML prediction but sanity check against mathematical stock coverage
        if (stockout_flag or days_to_stockout_estimate <= 3) and days_to_stockout_estimate <= 10:
            urgency = "High"
        elif (stockout_flag or days_to_stockout_estimate <= 7) and days_to_stockout_estimate <= 20:
            urgency = "Medium"
        else:
            urgency = "Low"

        # Build human-readable recommendation reason
        reason = _build_reason(
            product_name=product_name,
            stockout_flag=stockout_flag,
            days_to_stockout=days_to_stockout_estimate,
            avg_daily=avg_daily,
            current_stock=current_stock,
            reorder_qty=reorder_qty,
            demand_growth_pct=demand_growth_pct,
            lead_time_days=lead_time_days,
            rainfall_mm=rainfall_mm,
            festival_flag=festival_flag,
            port_congestion_level=port_congestion_level,
        )

        return {
            "stockout_predicted": bool(stockout_flag),
            "confidence": round(confidence, 4),
            "recommended_reorder_qty": reorder_qty,
            "urgency_level": urgency,
            "days_to_stockout_estimate": min(days_to_stockout_estimate, 999),
            "recommendation_reason": reason,
            "model_source": "ml_model",
        }

    except Exception as exc:
        logger.warning("ML inference failed, falling back to heuristic: %s", exc)
        flag, confidence, reorder_qty, urgency = _heuristic_prediction(
            current_stock, avg_daily, lead_time_days
        )
        reason = _build_reason(
            product_name=product_name,
            stockout_flag=flag,
            days_to_stockout=days_to_stockout_estimate,
            avg_daily=avg_daily,
            current_stock=current_stock,
            reorder_qty=reorder_qty,
            demand_growth_pct=demand_growth_pct,
            lead_time_days=lead_time_days,
            rainfall_mm=rainfall_mm,
            festival_flag=festival_flag,
            port_congestion_level=port_congestion_level,
        )
        return {
            "stockout_predicted": bool(flag),
            "confidence": round(confidence, 4),
            "recommended_reorder_qty": reorder_qty,
            "urgency_level": urgency,
            "days_to_stockout_estimate": min(days_to_stockout_estimate, 999),
            "recommendation_reason": reason,
            "model_source": "heuristic_fallback",
        }


def generate_demand_forecast(
    product_name: str,
    avg_daily_sales_7d: float,
    avg_daily_sales_30d: float,
    demand_growth_pct: float = 0.0,
    forecast_days: int = 7,
) -> list[dict]:
    """
    Generate a 7-day demand forecast using trend + weekday variation.
    Returns list of {date, day, predicted_demand, lower_bound, upper_bound, weekday}.
    """
    # Weekday demand multipliers (commercial goods have Mon-Fri peak, Sun trough)
    WEEKDAY_MULT = {
        "Monday": 1.14, "Tuesday": 1.08, "Wednesday": 1.05,
        "Thursday": 1.11, "Friday": 1.18, "Saturday": 0.88, "Sunday": 0.70,
    }

    base = (avg_daily_sales_7d + avg_daily_sales_30d) / 2 if (avg_daily_sales_7d or avg_daily_sales_30d) else 10.0
    growth_rate = max(-0.5, min(0.5, demand_growth_pct))
    # Std dev at least 20% of base so confidence band is visible
    std_dev = max(1.5, base * 0.20)

    forecast = []
    for i in range(1, forecast_days + 1):
        date_obj = datetime.utcnow() + timedelta(days=i)
        weekday = date_obj.strftime("%A")
        mult = WEEKDAY_MULT.get(weekday, 1.0)
        trend_factor = 1 + (growth_rate * i / 30)
        predicted = max(0.0, base * trend_factor * mult)
        lower = max(0.0, predicted - std_dev * 1.5)
        upper = predicted + std_dev * 1.5

        forecast.append({
            "date": date_obj.strftime("%Y-%m-%d"),
            "day": date_obj.strftime("%a %d"),
            "weekday": weekday,
            "predicted_demand": round(predicted, 1),
            "lower_bound": round(lower, 1),
            "upper_bound": round(upper, 1),
        })
    return forecast

