# app/schemas/employees.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EmployeeRoleEnum(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"

class EmployeeCreateSchema(BaseModel):
    phone: str = Field(..., description="شماره همراه کاربر ثبت‌نام شده", example="09129876543")
    national_id: str = Field(..., description="کد ملی کارمند", example="0012345678")
    department: Optional[str] = Field(None, description="دپارتمان یا بخش کاری", example="فنی و توسعه")
    position: Optional[str] = Field(None, description="عنوان شغلی", example="توسعه‌دهنده Senior Backend")
    role: Optional[EmployeeRoleEnum] = Field(EmployeeRoleEnum.EMPLOYEE, description="نقش سازمانی (EMPLOYEE یا MANAGER)")

class EmployeeUpdateSchema(BaseModel):
    national_id: Optional[str] = Field(None, description="کد ملی")
    role: Optional[EmployeeRoleEnum] = Field(None, description="نقش سازمانی")
    department: Optional[str] = Field(None, description="دپارتمان")
    position: Optional[str] = Field(None, description="عنوان شغلی")
    is_active: Optional[bool] = Field(None, description="وضعیت فعال/غیرفعال بودن حساب")

class EmployeePublicResponseSchema(BaseModel):
    id: str = Field(..., description="شناسه یکتا")
    name: str = Field(..., description="نام و نام خانوادگی")
    department: Optional[str] = Field(None, description="دپارتمان")
    position: Optional[str] = Field(None, description="عنوان شغلی")
    avatar: Optional[str] = Field(None, description="آدرس تصویر پروفایل")

class EmployeeDetailResponseSchema(BaseModel):
    id: str = Field(..., description="شناسه یکتای کارمند")
    name: str = Field(..., description="نام و نام خانوادگی")
    phone: str = Field(..., description="شماره همراه")
    national_id: Optional[str] = Field(None, description="کد ملی")
    email: Optional[str] = Field(None, description="ایمیل")
    role: str = Field(..., description="نقش سازمانی")
    department: Optional[str] = Field(None, description="دپارتمان")
    position: Optional[str] = Field(None, description="عنوان شغلی")
    avatar: Optional[str] = Field(None, description="آدرس تصویر پروفایل")
    is_active: bool = Field(True, description="وضعیت فعال بودن")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None