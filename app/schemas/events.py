# app/schemas/events.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EventCreateSchema(BaseModel):
    title: str = Field(..., description="عنوان رویداد", example="همایش تازه‌های هوافضا")
    slug: str = Field(..., description="شناسه متنی یکتا جهت URL", example="aerospace-news-conference")
    description: Optional[str] = Field(None, description="توضیحات کوتاه", example="بررسی آخرین دستاوردهای صنعت هوافضا")
    content: Optional[str] = Field(None, description="متن کامل و جزئیات رویداد")
    cover_image: Optional[str] = Field(None, description="آدرس تصویر کاور", example="/uploads/events/cover.jpg")
    start_date: Optional[datetime] = Field(None, description="تاریخ و زمان شروع")
    end_date: Optional[datetime] = Field(None, description="تاریخ و زمان پایان")
    location: Optional[str] = Field(None, description="مکان برگزاری (در صورت حضوری)", example="سالن همایش‌های مرکزی")
    is_online: Optional[bool] = Field(False, description="برگزاری به صورت آنلاین")
    capacity: Optional[int] = Field(None, description="ظرفیت رویداد", example=100)
    price: Optional[float] = Field(0.0, description="قیمت ورودی (صفر برای رایگان)", example=50000.0)
    category: Optional[str] = Field(None, description="دسته‌بندی رویداد", example="کارگاه آموزشی")
    is_active: Optional[bool] = Field(True, description="وضعیت فعال/غیرفعال")

class EventUpdateSchema(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    is_online: Optional[bool] = None
    capacity: Optional[int] = None
    price: Optional[float] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class EventResponseSchema(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    is_online: bool
    capacity: Optional[int] = None
    price: float
    category: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EventPaginatedResponseSchema(BaseModel):
    total: int
    page: int
    size: int
    items: List[EventResponseSchema]