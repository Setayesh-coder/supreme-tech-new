# app/schemas/blog.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class BlogPostCreateSchema(BaseModel):
    title: str = Field(..., description="عنوان مقاله", example="بررسی فریم‌ورک FastAPI")
    slug: str = Field(..., description="اسلاگ یکتا برای URL", example="fastapi-guide")
    summary: Optional[str] = Field(None, description="خلاصه مقاله", example="معرفی کوتاه امکانات FastAPI")
    content: str = Field(..., description="محتوای کامل مقاله (Markdown یا HTML)", example="<p>متن کامل مقاله</p>")
    cover_image: Optional[str] = Field(None, description="آدرس تصویر کاور", example="/static/uploads/cover.jpg")
    author_name: Optional[str] = Field("تیم سپریم تک", description="نام نویسنده", example="آرشام")
    tags: Optional[List[str]] = Field(default=[], description="لیست تگ‌ها", example=["پایتون", "بک‌اند", "FastAPI"])
    published: Optional[bool] = Field(True, description="وضعیت انتشار")

class BlogPostUpdateSchema(BaseModel):
    title: Optional[str] = Field(None, description="عنوان مقاله")
    slug: Optional[str] = Field(None, description="اسلاگ یکتا")
    summary: Optional[str] = Field(None, description="خلاصه مقاله")
    content: Optional[str] = Field(None, description="محتوای مقاله")
    cover_image: Optional[str] = Field(None, description="آدرس تصویر کاور")
    author_name: Optional[str] = Field(None, description="نام نویسنده")
    tags: Optional[List[str]] = Field(None, description="لیست تگ‌ها")
    published: Optional[bool] = Field(None, description="وضعیت انتشار")

class BlogPostResponseSchema(BaseModel):
    id: str = Field(..., description="شناسه مقاله")
    title: str = Field(..., description="عنوان")
    slug: str = Field(..., description="اسلاگ")
    summary: Optional[str] = Field(None, description="خلاصه")
    content: str = Field(..., description="محتوا")
    cover_image: Optional[str] = Field(None, description="تصویر کاور")
    author_name: str = Field(..., description="نویسنده")
    tags: List[str] = Field(default=[], description="لیست تگ‌ها")
    views_count: int = Field(0, description="تعداد بازدید")
    likes_count: int = Field(0, description="تعداد لایک‌ها")
    published: bool = Field(True, description="وضعیت انتشار")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class BlogPaginatedResponseSchema(BaseModel):
    items: List[BlogPostResponseSchema]
    total: int = Field(..., description="تعداد کل مقالات")
    page: int = Field(..., description="شماره صفحه جاری")
    limit: int = Field(..., description="تعداد در هر صفحه")

class LikeStatusResponseSchema(BaseModel):
    is_liked: bool = Field(..., description="آیا کاربر پست را لایک کرده است؟")
    likes_count: int = Field(..., description="تعداد کل لایک‌های پست")