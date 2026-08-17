# app/models/blog.py
from typing import Optional, List
from sqlalchemy import String, Text, Integer, Boolean, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

blog_likes = Table(
    "blog_likes",
    BaseModel.metadata,
    Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("blog_id", String(36), ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True)
)

class BlogPost(BaseModel):
    __tablename__ = "blog_posts"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    cover_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    author_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    published: Mapped[bool] = mapped_column(Boolean, default=True)

    liked_by_users: Mapped[List["User"]] = relationship("User", secondary=blog_likes)