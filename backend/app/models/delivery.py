"""Delivery models"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
from sqlalchemy.orm import relationship
from app.db.session import Base


class DeliveryUpdate(Base):
    __tablename__ = "delivery_updates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    status = Column(String(30), nullable=False)
    location = Column(Geography(geometry_type="POINT", srid=4326))
    note = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="delivery_updates")


class ReorderLog(Base):
    __tablename__ = "reorder_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("inventory.id"))
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"))
    status = Column(String(20))
    response = Column(Text)
    called_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Inventory", back_populates="reorder_logs")
    supplier = relationship("Supplier", back_populates="reorder_logs")


class Godown(Base):
    __tablename__ = "godowns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    location = Column(Geography(geometry_type="POINT", srid=4326))
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="godowns", foreign_keys=[owner_id])
    inventory_items = relationship("Inventory", back_populates="godown")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(20), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="worker")
    godown_id = Column(UUID(as_uuid=True), ForeignKey("godowns.id", use_alter=True))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    godowns = relationship("Godown", back_populates="owner", foreign_keys=[Godown.owner_id])


class CallLog(Base):
    __tablename__ = "call_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_sid = Column(String(100))
    caller_phone = Column(String(15))
    intent = Column(String(50))
    transcript = Column(Text)
    response = Column(Text)
    duration = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class TelegramMessage(Base):
    __tablename__ = "telegram_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(BigInteger, nullable=False)
    message_type = Column(String(50))
    message_text = Column(Text)
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="sent")


