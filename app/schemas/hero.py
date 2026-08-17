# app/schemas/hero.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class HeroSlideCreateSchema(BaseModel):
    title: str = Field(..., description="عنوان اسلاید", example="توسعه سامانه‌های هوایی و فضایی")
    subtitle: Optional[str] = Field(None, description="زیرعنوان اسلاید", example="تیم تخصصی سپریم تک")
    tagline: Optional[str] = Field(None, description="شعار یا برچسب بالای عنوان", example="نوآوری در صنعت")  # فیلد جدید
    description: Optional[str] = Field(None, description="توضیحات کوتاه", example="طراحی و شبیه‌سازی عددی پروژه‌های پیشرفته")
    image_url: str = Field(..., description="آدرس تصویر بنر/هیرو", example="/uploads/hero/banner1.jpg")
    button_text: Optional[str] = Field(None, description="متن دکمه اکشن", example="مشاهده دوره‌ها")
    button_link: Optional[str] = Field(None, description="لینک دکمه اکشن", example="/courses")
    order: Optional[int] = Field(0, description="اولویت نمایش")
    is_active: Optional[bool] = Field(True, description="وضعیت نمایش")

class HeroSlideUpdateSchema(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    tagline: Optional[str] = None  # فیلد جدید
    description: Optional[str] = None
    image_url: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

class HeroReorderItemSchema(BaseModel):
    id: str = Field(..., description="شناسه آیتم هیرو")
    order: int = Field(..., description="ترتیب جدید")

class HeroReorderSchema(BaseModel):
    items: List[HeroReorderItemSchema]

class HeroSlideResponseSchema(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    tagline: Optional[str] = None  # فیلد جدید
    description: Optional[str] = None
    image_url: str
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    order: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True