# app/models/message.py
from typing import Optional
from sqlalchemy import String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel

class Message(BaseModel):
    __tablename__ = "messages"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    project_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # نوع پروژه
    project_description: Mapped[str] = mapped_column(Text, nullable=False)           # توضیحات پروژه
    
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)