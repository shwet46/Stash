"""Stash Backend — FastAPI Application Entry Point"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import init_db

# Import API routers
from app.api.voice import router as voice_router
from app.api.inventory import router as inventory_router
from app.api.orders import router as orders_router
from app.api.suppliers import router as suppliers_router
from app.api.billing import router as billing_router
from app.api.analytics import router as analytics_router
from app.api.delivery import router as delivery_router
from app.api.telegram import router as telegram_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events"""
    # Startup
    print("🚀 Starting Stash Backend...")
    await init_db()
    print("✅ Database initialized")

    # Register Telegram webhook (non-blocking)
    if settings.TELEGRAM_BOT_TOKEN:
        try:
            from app.services.telegram_svc import register_telegram_webhook

            result = await register_telegram_webhook()
            print(f"📱 Telegram webhook: {result}")
        except Exception as e:
            print(f"⚠️ Telegram webhook registration failed: {e}")

    yield

    # Shutdown
    print("🔴 Shutting down Stash Backend...")


app = FastAPI(
    title="Stash — Voice-Native AI Supply Chain Platform",
    description="Backend API for India's godown management platform. "
    "Manages inventory, orders, suppliers, billing, and voice interactions.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://stash-app.web.app",
        "*",  # In production, restrict to specific origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(voice_router)
app.include_router(inventory_router)
app.include_router(orders_router)
app.include_router(suppliers_router)
app.include_router(billing_router)
app.include_router(analytics_router)
app.include_router(delivery_router)
app.include_router(telegram_router)
app.include_router(auth_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "app": "Stash",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check for load balancers"""
    return {"status": "healthy"}
