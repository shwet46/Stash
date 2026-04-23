from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.delivery import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.phone == user_in.phone))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this phone number already exists",
        )
    
    # Create new user
    db_user = User(
        name=user_in.name,
        phone=user_in.phone,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.phone == user_in.phone))
    user = result.scalars().first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.phone, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(db: AsyncSession = Depends(get_db), current_user_phone: str = Depends(lambda: "admin")): # Mock for now
    result = await db.execute(select(User).where(User.phone == current_user_phone))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
