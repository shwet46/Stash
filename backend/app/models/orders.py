"""Order models"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_ref = Column(String(20), unique=True, nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("buyers.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("inventory.id"))
    quantity = Column(Integer, nullable=False)
    status = Column(String(30), default="pending")
    estimated_delivery = Column(Date)
    total_amount = Column(Numeric(12, 2))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    buyer = relationship("Buyer", back_populates="orders")
    product = relationship("Inventory", back_populates="orders")
    bill = relationship("Bill", back_populates="order", uselist=False)
    delivery_updates = relationship("DeliveryUpdate", back_populates="order")
