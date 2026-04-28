"""Stash Backend — FastAPI Application Entry Point"""
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import API routers
from app.api.voice import router as voice_router
from app.api.inventory import router as inventory_router
from app.api.orders import router as orders_router
from app.api.suppliers import router as suppliers_router
from app.api.billing import router as billing_router
from app.api.analytics import router as analytics_router
from app.api.analytics_export import router as analytics_export_router
from app.api.delivery import router as delivery_router
from app.api.telegram import router as telegram_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.barter import router as barter_router
from app.api.forecasting import router as forecasting_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events"""
    # Startup
    print("Starting Stash Backend...")
    print("Database initialized")

    # Warm up ML models
    try:
        from app.services.ml_pipeline import get_model_status
        status = get_model_status()
        if status["models_loaded"]:
            print("✅ ML models loaded and ready")
        else:
            print(f"⚠ ML models using heuristic fallback: {status['error']}")
    except Exception as e:
        print(f"⚠ ML model warm-up failed: {e}")

    # Register Telegram webhook (non-blocking)
    if settings.TELEGRAM_BOT_TOKEN:
        # If developer wants to use ngrok locally, start a tunnel and set the webhook URL
        try:
            use_ngrok = os.environ.get("USE_NGROK", "True").lower() == "true"
            if use_ngrok and not (settings.TELEGRAM_WEBHOOK_URL or settings.BACKEND_URL):
                try:
                    from pyngrok import ngrok

                    # Default backend port where uvicorn will run
                    ngrok_port = int(os.environ.get("PORT", 8000))
                    tunnel = ngrok.connect(ngrok_port)
                    public_url = tunnel.public_url
                    # Prefer explicit webhook path; register_telegram_webhook will append path if needed
                    settings.TELEGRAM_WEBHOOK_URL = public_url
                    print(f"Ngrok tunnel started at {public_url}; will register Telegram webhook against this URL")
                except Exception as _e:
                    print(f"Ngrok auto-start skipped: {_e}")

            from app.services.telegram_svc import register_telegram_webhook

            result = await register_telegram_webhook()
            print(f"Telegram webhook: {result}")
        except Exception as e:
            print(f" Telegram webhook registration failed: {e}")

    # Start background scheduler (reorder, reminders, delivery, prediction alerts)
    try:
        from app.workers.scheduler import setup_scheduler

        setup_scheduler()
    except Exception as e:
        print(f"⚠ Scheduler startup failed: {e}")

    yield

    # Shutdown
    try:
        from app.workers.scheduler import scheduler

        if scheduler.running:
            scheduler.shutdown(wait=False)
    except Exception as e:
        print(f"⚠ Scheduler shutdown failed: {e}")

    print("Shutting down Stash Backend...")


app = FastAPI(
    title="Stash: Voice-Native AI Supply Chain Platform",
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
        "http://127.0.0.1:3000",
        "https://stash-app.web.app",
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
app.include_router(analytics_export_router)
app.include_router(delivery_router)
app.include_router(telegram_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(barter_router)
app.include_router(forecasting_router)


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
