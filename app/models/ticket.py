# app/models/ticket.py
from typing import Optional, List
from enum import Enum
from sqlalchemy import String, Text, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

ticket_members = Table(
    "ticket_members",
    BaseModel.metadata,
    Column("ticket_id", String(36), ForeignKey("tickets.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)

class TicketStatus(str, Enum):
    OPEN = "open"
    PENDING = "pending"
    ANSWERED = "answered"
    CLOSED = "closed"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Ticket(BaseModel):
    __tablename__ = "tickets"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default=TicketPriority.MEDIUM)
    status: Mapped[str] = mapped_column(String(20), default=TicketStatus.OPEN)
    
    creator_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # روابط
    creator: Mapped["User"] = relationship("User", foreign_keys=[creator_id], back_populates="created_tickets")
    members: Mapped[List["User"]] = relationship("User", secondary=ticket_members)
    messages: Mapped[List["TicketMessage"]] = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")

class TicketMessage(BaseModel):
    __tablename__ = "ticket_messages"

    ticket_id: Mapped[str] = mapped_column(String(36), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    sender_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    attachments: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # روابط
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="messages")
    sender: Mapped["User"] = relationship("User")