"""Analytics API endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
async def dashboard_summary(db: AsyncSession = Depends(get_db)):
    """Get dashboard summary statistics"""
    # In production, these would be computed from actual database queries
    return {
        "total_inventory_value": 1845000,
        "active_orders": 47,
        "monthly_revenue": 1280000,
        "voice_calls_today": 23,
        "low_stock_items": 3,
        "pending_payments": 156750,
        "deliveries_in_transit": 2,
        "supplier_count": 8,
        "buyer_count": 48,
        "godown_count": 5,
    }


@router.get("/revenue")
async def revenue_analytics(period: str = "6m", db: AsyncSession = Depends(get_db)):
    """Get revenue analytics"""
    return {
        "period": period,
        "data": [
            {"month": "Oct", "revenue": 680000, "orders": 120},
            {"month": "Nov", "revenue": 750000, "orders": 135},
            {"month": "Dec", "revenue": 890000, "orders": 160},
            {"month": "Jan", "revenue": 920000, "orders": 155},
            {"month": "Feb", "revenue": 1050000, "orders": 180},
            {"month": "Mar", "revenue": 1180000, "orders": 195},
            {"month": "Apr", "revenue": 1280000, "orders": 210},
        ],
        "total_revenue": 5750000,
        "growth_rate": 18.0,
    }


@router.get("/top-products")
async def top_products(db: AsyncSession = Depends(get_db)):
    """Get top products by revenue"""
    return [
        {"name": "Basmati Rice", "revenue": 285000, "orders": 42},
        {"name": "Chana Dal", "revenue": 195000, "orders": 35},
        {"name": "Sugar", "revenue": 168000, "orders": 31},
        {"name": "Wheat Flour", "revenue": 142000, "orders": 28},
        {"name": "Toor Dal", "revenue": 118000, "orders": 24},
    ]


@router.get("/top-buyers")
async def top_buyers(db: AsyncSession = Depends(get_db)):
    """Get top buyers by revenue"""
    return [
        {"name": "Mehta & Sons", "revenue": 285000, "orders": 42},
        {"name": "Kumar Trading", "revenue": 195000, "orders": 35},
        {"name": "Patel Grocers", "revenue": 168000, "orders": 31},
        {"name": "Sharma Stores", "revenue": 142000, "orders": 28},
        {"name": "Singh & Co.", "revenue": 118000, "orders": 24},
    ]


@router.get("/godown-performance")
async def godown_performance(db: AsyncSession = Depends(get_db)):
    """Get performance metrics per godown"""
    return [
        {"name": "Mumbai Central", "revenue": 520000, "products": 15, "orders": 85},
        {"name": "Pune Warehouse", "revenue": 320000, "products": 10, "orders": 52},
        {"name": "Nashik Depot", "revenue": 180000, "products": 8, "orders": 28},
        {"name": "Ahmedabad Store", "revenue": 145000, "products": 6, "orders": 25},
        {"name": "Surat Godown", "revenue": 115000, "products": 5, "orders": 20},
    ]
