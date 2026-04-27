"""Stash Backend — Core Configuration"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Stash"
    DEBUG: bool = True
    BACKEND_URL: str = "http://localhost:8000"

    # Database
    REDIS_URL: str = "redis://localhost:6379/0"

    # Google AI
    GOOGLE_AI_API_KEY: str = ""
    GOOGLE_CLOUD_PROJECT: str = ""
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    FIRESTORE_DATABASE: str = "stash"
    BIGQUERY_DATASET: str = "stash_analytics"
    FIREBASE_STORAGE_BUCKET: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    GOOGLE_TRANSLATE_API_KEY: str = ""

    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBHOOK_SECRET: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # Auth
    SECRET_KEY: str = "stash-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # IMD Weather
    IMD_API_BASE_URL: str = "https://api.imd.gov.in"

    # Additional keys from shared .env
    NEXTAUTH_SECRET: str = ""
    NEXTAUTH_URL: str = ""
    NEXT_PUBLIC_API_URL: str = ""
    ELEVENLABS_API_KEY: str = ""
    GCP_REGION: str = "us-central1"


    model_config = {
        "env_file": (".env", "../.env"),
        "case_sensitive": True,
        "extra": "ignore"
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
