# app/schemas/team.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class TeamMemberCreateSchema(BaseModel):
    full_name: str = Field(..., description="نام و نام خانوادگی عضو تیم", example="آرشام")
    role: str = Field(..., description="سمت / نقش شغلی", example="توسعه‌دهنده ارشد بک‌اند")
    image_url: Optional[str] = Field(None, description="آدرس تصویر آواتار", example="/uploads/team/arsham.jpg")
    bio: Optional[str] = Field(None, description="توضیحات کوتاه / بیوگرافی")
    email: Optional[EmailStr] = Field(None, description="ایمیل کاری")
    linkedin_url: Optional[str] = Field(None, description="لینک پروفایل لینکدین")
    github_url: Optional[str] = Field(None, description="لینک گیت‌هاب")
    display_order: Optional[int] = Field(0, description="ترتیب نمایش در سایت")
    is_active: Optional[bool] = Field(True, description="وضعیت فعال/غیرفعال")

class TeamMemberUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    image_url: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class TeamMemberResponseSchema(BaseModel):
    id: str
    full_name: str
    role: str
    image_url: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    display_order: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True