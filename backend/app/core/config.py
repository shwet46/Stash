"""Stash Backend — Core Configuration"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache
from sqlalchemy.engine import make_url


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Stash"
    DEBUG: bool = True
    BACKEND_URL: str = "http://localhost:8000"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://stash:stash@localhost:5432/stash"
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

    def resolved_database_url(self) -> str:
        """Resolve DB host for containerized runs when DATABASE_URL points to localhost."""
        db_url = self.DATABASE_URL
        try:
            parsed = make_url(db_url)
            if not parsed.drivername.startswith("postgresql"):
                return db_url

            in_docker = os.path.exists("/.dockerenv")
            if in_docker and parsed.host in {"localhost", "127.0.0.1", "::1"}:
                # In Docker, localhost points to the container itself.
                docker_host = os.getenv("POSTGRES_HOST", "postgres")
                return parsed.set(host=docker_host).render_as_string(hide_password=False)

            if not in_docker and parsed.host in {"postgres", "db"}:
                # Outside Docker, service names don't resolve from the host machine.
                return parsed.set(host="localhost").render_as_string(hide_password=False)
        except Exception:
            return db_url
        return db_url

    model_config = {
        "env_file": (".env", "../.env"),
        "case_sensitive": True,
        "extra": "ignore"
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
