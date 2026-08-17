from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime, date

class UserRoleEnum(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"
    MANAGER = "MANAGER"

# ==========================================
# اسکیمای ورودی (Request Schemas)
# ==========================================

class UserCreateSchema(BaseModel):
    name: str = Field(..., description="نام و نام خانوادگی", example="علی رضایی")
    email: EmailStr = Field(..., description="پست الکترونیکی", example="ali@example.com")
    password: str = Field(..., min_length=6, description="رمز عبور", example="Password123!")
    role: UserRoleEnum = Field(UserRoleEnum.USER, description="نقش کاربری")
    phone: Optional[str] = Field(None, description="شماره همراه", example="09123456789")
    avatar: Optional[str] = Field(None, description="لینک آواتار")
    province: Optional[str] = Field(None, description="استان", example="تهران")
    birth_date: Optional[date] = Field(None, description="تاریخ تولد", example="1995-05-20")
    gender: Optional[str] = Field(None, description="جنسیت", example="مرد")

class UserUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, description="نام و نام خانوادگی")
    email: Optional[EmailStr] = Field(None, description="پست الکترونیکی")
    phone: Optional[str] = Field(None, description="شماره همراه")
    avatar: Optional[str] = Field(None, description="لینک آواتار")
    province: Optional[str] = Field(None, description="استان", example="تهران")
    birth_date: Optional[date] = Field(None, description="تاریخ تولد", example="1995-05-20", alias="birthDate")
    gender: Optional[str] = Field(None, description="جنسیت", example="مرد")

class UserRoleUpdateSchema(BaseModel):
    role: UserRoleEnum = Field(..., description="نقش جدید کاربر")
    
class ChangePasswordSchema(BaseModel):
    current_password: str = Field(..., description="رمز عبور فعلی")
    new_password: str = Field(..., min_length=6, description="رمز عبور جدید")


# ==========================================
# اسکیمای خروجی (Response Schemas)
# ==========================================

class UserResponseSchema(BaseModel):
    id: str = Field(..., description="شناسه کاربر", example="usr_101")
    name: str = Field(..., description="نام و نام خانوادگی")
    email: Optional[str] = Field(None, description="پست الکترونیکی")
    role: UserRoleEnum = Field(..., description="نقش کاربری")
    phone: Optional[str] = Field(None, description="شماره همراه")
    avatar: Optional[str] = Field(None, description="لینک آواتار")
    
    # فیلدهای جدید در خروجی
    province: Optional[str] = Field(None, description="استان")
    birth_date: Optional[date] = Field(None, alias="birthDate", description="تاریخ تولد")
    gender: Optional[str] = Field(None, description="جنسیت")

    is_active: bool = Field(True, alias="isActive", description="وضعیت حساب کاربری")
    created_at: datetime = Field(..., alias="createdAt", description="تاریخ ثبت‌نام")
    updated_at: datetime = Field(..., alias="updatedAt", description="تاریخ آخرین به‌روزرسانی")

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

class UserPaginatedResponseSchema(BaseModel):
    items: List[UserResponseSchema]
    total: int = Field(..., description="تعداد کل کاربران", example=45)
    page: int = Field(..., description="صفحه جاری", example=1)
    limit: int = Field(..., description="تعداد آیتم در هر صفحه", example=10)
    pages: int = Field(..., description="تعداد کل صفحات", example=5)