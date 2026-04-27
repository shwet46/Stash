from fastapi import APIRouter, Depends, HTTPException, status
import logging
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from datetime import timedelta, datetime
import uuid
from app.core.config import settings
from app.services.firestore_service import firestore_service
from app.services.telegram_svc import send_welcome_message_by_phone

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
logger = logging.getLogger(__name__)


def _phone_candidates(phone: str) -> list[str]:
    raw = (phone or "").strip()
    if not raw:
        return []

    digits = "".join(ch for ch in raw if ch.isdigit())
    candidates: list[str] = []

    if digits.startswith("91") and len(digits) >= 12:
        local = digits[2:12]
    elif len(digits) >= 10:
        local = digits[-10:]
    else:
        local = ""

    if local:
        candidates.extend([f"+91{local}", local])

    candidates.extend([raw, digits])

    # Preserve order while removing duplicates.
    ordered_unique: list[str] = []
    for candidate in candidates:
        if candidate and candidate not in ordered_unique:
            ordered_unique.append(candidate)
    return ordered_unique


def _normalize_indian_phone(phone: str) -> str:
    candidates = _phone_candidates(phone)
    if not candidates:
        raise HTTPException(status_code=400, detail="Phone number is required")

    for candidate in candidates:
        if candidate.startswith("+91") and len(candidate) == 13:
            return candidate

    raise HTTPException(status_code=400, detail="Invalid Indian phone number")


def get_current_user_phone(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        phone = payload.get("sub")
        if not phone:
            raise credentials_exception
        return str(phone)
    except JWTError:
        raise credentials_exception


async def _get_user_by_phone(phone: str):
    if not firestore_service.is_enabled or not firestore_service.db:
        return None
    try:
        for phone_candidate in _phone_candidates(phone):
            docs = (
                firestore_service.db
                .collection("users")
                .where("phone", "==", phone_candidate)
                .limit(1)
                .stream()
            )
            async for doc in docs:
                d = doc.to_dict()
                d["id"] = doc.id
                return d
    except Exception as exc:
        logger.warning("Failed fetching user from Firestore: %s", exc)
        return None
    return None


@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate):
    normalized_phone = _normalize_indian_phone(user_in.phone)

    # Check if user already exists
    existing_user = await _get_user_by_phone(normalized_phone)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this phone number already exists",
        )
    
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=500, detail="Firestore disabled")

    new_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat()
    
    user_data = {
        "id": new_id,
        "name": user_in.name,
        "phone": normalized_phone,
        "email": user_in.email,
        "hashed_password": get_password_hash(user_in.password),
        "role": user_in.role,
        "created_at": now_iso
    }

    try:
        await firestore_service.db.collection("users").document(new_id).set(user_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing user in Firestore: {e}")

    # Welcome message should not block registration flow.
    try:
        await send_welcome_message_by_phone(normalized_phone)
    except Exception as exc:
        logger.warning("Welcome message could not be delivered for %s: %s", normalized_phone, exc)

    return user_data

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin):
    if not firestore_service.is_enabled:
        raise HTTPException(status_code=503, detail="Auth unavailable: Firestore disabled")
    user = await _get_user_by_phone(user_in.phone)
    if not user or not verify_password(user_in.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.get("phone"), expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user_phone: str = Depends(get_current_user_phone),
):
    user = await _get_user_by_phone(current_user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
