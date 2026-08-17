# app/schemas/courses.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CourseCreateSchema(BaseModel):
    title: str = Field(..., description="عنوان دوره آموزشی", example="آموزش جامع FastAPI و Pydantic")
    slug: str = Field(..., description="اسلاگ یکتای URL دوره", example="fastapi-comprehensive-course")
    description: Optional[str] = Field(None, description="توضیحات کامل دوره", example="در این دوره از صفر تا صد FastAPI بررسی می‌شود.")
    cover_image: Optional[str] = Field(None, description="آدرس تصویر کاور دوره", example="/static/uploads/courses/fastapi.jpg")
    price: float = Field(0.0, description="قیمت دوره به تومان", example=2500000)
    duration_hours: Optional[int] = Field(None, description="مدت زمان دوره به ساعت", example=40)
    instructor_name: Optional[str] = Field(None, description="نام مدرس دوره", example="آرشام علی‌زاده")
    is_active: Optional[bool] = Field(True, description="فعال/غیرفعال بودن دوره")
    event_id: Optional[str] = Field(None, description="شناسه رویداد مرتبط (در صورت وجود)", example="550e8400-e29b-41d4-a716-446655440000")

class CourseUpdateSchema(BaseModel):
    title: Optional[str] = Field(None, description="عنوان دوره آموزشی")
    slug: Optional[str] = Field(None, description="اسلاگ یکتای URL دوره")
    description: Optional[str] = Field(None, description="توضیحات دوره")
    cover_image: Optional[str] = Field(None, description="آدرس تصویر کاور")
    price: Optional[float] = Field(None, description="قیمت دوره")
    duration_hours: Optional[int] = Field(None, description="مدت زمان به ساعت")
    instructor_name: Optional[str] = Field(None, description="نام مدرس")
    is_active: Optional[bool] = Field(None, description="وضعیت فعال بودن")
    event_id: Optional[str] = Field(None, description="شناسه رویداد مرتبط")

class CourseResponseSchema(BaseModel):
    id: str = Field(..., description="شناسه یکتای دوره")
    title: str = Field(..., description="عنوان دوره")
    slug: str = Field(..., description="اسلاگ دوره")
    description: Optional[str] = Field(None, description="توضیحات")
    cover_image: Optional[str] = Field(None, description="تصویر کاور")
    price: float = Field(..., description="قیمت")
    duration_hours: Optional[int] = Field(None, description="مدت زمان (ساعت)")
    instructor_name: Optional[str] = Field(None, description="نام مدرس")
    is_active: bool = Field(..., description="وضعیت فعال")
    event_id: Optional[str] = Field(None, description="شناسه رویداد مرتبط")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CoursePaginatedResponseSchema(BaseModel):
    items: List[CourseResponseSchema]
    total: int = Field(..., description="تعداد کل دوره‌ها")
    page: int = Field(..., description="شماره صفحه جاری")
    limit: int = Field(..., description="تعداد در هر صفحه")