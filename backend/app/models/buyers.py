"""Buyer models"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Date, DateTime, Numeric, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    phone = Column(String(15), unique=True, nullable=False)
    telegram_chat_id = Column(BigInteger)
    telegram_username = Column(String(100))
    credit_limit = Column(Numeric(12, 2), default=0)
    current_balance = Column(Numeric(12, 2), default=0)
    credit_due_date = Column(Date)
    preferred_language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    orders = relationship("Order", back_populates="buyer")
    bills = relationship("Bill", back_populates="buyer")
    credit_transactions = relationship("CreditTransaction", back_populates="buyer")
