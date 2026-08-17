# app/models/hero.py
from typing import Optional
from sqlalchemy import String, Text, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel

class HeroSlide(BaseModel):
    __tablename__ = "hero_slides"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    tagline: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # فیلد جدید
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    button_text: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    button_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)