"""Inventory models"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_name = Column(String(255), nullable=False)
    category = Column(String(50))
    current_stock = Column(Integer, nullable=False, default=0)
    threshold = Column(Integer, nullable=False, default=100)
    unit = Column(String(20))
    expiry_date = Column(Date)
    godown_id = Column(UUID(as_uuid=True), ForeignKey("godowns.id"))
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    godown = relationship("Godown", back_populates="inventory_items")
    orders = relationship("Order", back_populates="product")
    suppliers = relationship("Supplier", back_populates="product")
    reorder_logs = relationship("ReorderLog", back_populates="product")
