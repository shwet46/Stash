import logging
import os
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from uuid import UUID

from google.api_core.exceptions import PermissionDenied
from google.cloud.firestore import AsyncClient

from app.core.config import settings


logger = logging.getLogger(__name__)

class FirestoreService:
    def __init__(self):
        self.db: AsyncClient | None = None
        self.users_collection = None
        self._enabled = False
        self._disabled_reason: str | None = None
        self._init_client()

    def _init_client(self) -> None:
        """Initialize Firestore client with safe defaults for local and docker runs."""
        try:
            backend_root = Path(__file__).resolve().parents[2]
            credentials_path = None

            if settings.GOOGLE_APPLICATION_CREDENTIALS:
                configured_path = Path(settings.GOOGLE_APPLICATION_CREDENTIALS)
                if not configured_path.is_absolute():
                    configured_path = backend_root / configured_path
                if configured_path.exists():
                    credentials_path = configured_path.resolve()
            else:
                default_path = backend_root / "credentials.json"
                if default_path.exists():
                    credentials_path = default_path.resolve()

            if credentials_path:
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(credentials_path)

            database_name = settings.FIRESTORE_DATABASE or "stash"
            self.db = AsyncClient(
                project=settings.GOOGLE_CLOUD_PROJECT or None,
                database=database_name,
            )
            self.users_collection = self.db.collection("users")
            self._enabled = True
        except Exception as exc:
            self._enabled = False
            self._disabled_reason = str(exc)
            logger.warning("Firestore client initialization failed: %s", exc)

    @property
    def is_enabled(self) -> bool:
        return self._enabled

    def _serialize_for_firestore(self, value):
        """Convert unsupported Python/SQLAlchemy values into Firestore-compatible values."""
        if isinstance(value, dict):
            return {k: self._serialize_for_firestore(v) for k, v in value.items()}
        if isinstance(value, list):
            return [self._serialize_for_firestore(v) for v in value]
        if isinstance(value, UUID):
            return str(value)
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    async def upsert_document(self, collection: str, doc_id: str, payload: dict):
        if not self._enabled or not self.db:
            return None

        cleaned_payload = self._serialize_for_firestore(payload)
        doc_ref = self.db.collection(collection).document(str(doc_id))
        try:
            await doc_ref.set(cleaned_payload)
        except PermissionDenied as exc:
            # Stop further attempts in this process if credentials lack Firestore permissions.
            self._enabled = False
            self._disabled_reason = "permission_denied"
            logger.warning("Firestore disabled due to permission error on %s/%s: %s", collection, doc_id, exc)
            return None
        except Exception as exc:
            logger.warning("Firestore upsert failed for %s/%s: %s", collection, doc_id, exc)
            return None
        return doc_id

    async def upsert_many(self, collection: str, records: list[dict], id_field: str = "id") -> int:
        if not self._enabled or not self.db:
            return 0

        count = 0
        for record in records:
            if not self._enabled:
                break
            record_id = record.get(id_field)
            if not record_id:
                continue
            result = await self.upsert_document(collection, str(record_id), record)
            if result:
                count += 1
        return count

    async def create_user(self, user_data: dict):
        """Stores user data in Firestore."""
        user_id = str(user_data.get("id"))
        if not self._enabled or not self.users_collection:
            return None

        doc_ref = self.users_collection.document(user_id)
        try:
            await doc_ref.set(self._serialize_for_firestore(user_data))
        except Exception as exc:
            logger.warning("Firestore create_user failed for %s: %s", user_id, exc)
            return None
        return user_id

    async def get_user(self, user_id: str):
        if not self._enabled or not self.users_collection:
            return None

        doc = await self.users_collection.document(user_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

firestore_service = FirestoreService()
