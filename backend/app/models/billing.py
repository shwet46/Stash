"""Billing models"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class Bill(Base):
    __tablename__ = "bills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bill_ref = Column(String(20), unique=True, nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("buyers.id"))
    amount = Column(Numeric(12, 2), nullable=False)
    gst_rate = Column(Numeric(5, 2), nullable=False)
    gst_amount = Column(Numeric(12, 2), nullable=False)
    total = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), default="pending")
    pdf_url = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="bill")
    buyer = relationship("Buyer", back_populates="bills")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("buyers.id"))
    amount = Column(Numeric(12, 2), nullable=False)
    type = Column(String(20), nullable=False)  # credit / debit
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    buyer = relationship("Buyer", back_populates="credit_transactions")
