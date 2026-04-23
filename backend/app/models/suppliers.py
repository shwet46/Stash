"""Supplier models"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    phone = Column(String(15), nullable=False)
    telegram_chat_id = Column(BigInteger)
    product_id = Column(UUID(as_uuid=True), ForeignKey("inventory.id"))
    priority = Column(Integer, nullable=False, default=1)
    status = Column(String(20), default="active")
    last_contacted = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Inventory", back_populates="suppliers")
    reorder_logs = relationship("ReorderLog", back_populates="supplier")
