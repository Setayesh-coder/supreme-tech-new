# app/schemas/auth.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional

# --- Admin Schemas ---
class AdminLoginSchema(BaseModel):
    phone: str = Field(..., description="شماره همراه مدیر", example="09121112233")
    password: str = Field(..., description="رمز عبور مدیر", example="admin123456")

class AdminRegisterSchema(BaseModel):
    phone: str = Field(..., description="شماره همراه مدیر", example="09121112233")
    password: str = Field(..., description="رمز عبور مدیر", example="admin123456")
    name: str = Field(..., description="نام و نام خانوادگی مدیر", example="مدیر سیستم")

class AdminAuthResponseSchema(BaseModel):
    token: str = Field(..., description="توکن دسترسی JWT مدیر")
    message: str = Field("ورود مدیر با موفقیت انجام شد", example="ورود مدیر با موفقیت انجام شد")
    adminId: Optional[str] = Field(None, description="شناسه اختصاصی مدیر")

class ChangePasswordSchema(BaseModel):
    current: str = Field(..., description="رمز عبور فعلی", example="old_pass_123")
    new: str = Field(..., description="رمز عبور جدید", example="new_pass_456")

# --- User Schemas ---
class UserRegisterSchema(BaseModel):
    phone: str = Field(..., description="شماره همراه کاربر", example="09123456789")
    name: str = Field(..., description="نام و نام خانوادگی", example="آرشام")
    password: Optional[str] = Field(None, description="رمز عبور (اختیاری)", example="user123456")
    email: Optional[EmailStr] = Field(None, description="پست الکترونیکی (اختیاری)", example="arsham@example.com")

class UserLoginSchema(BaseModel):
    phone: str = Field(..., description="شماره همراه کاربر", example="09123456789")
    password: Optional[str] = Field(None, description="رمز عبور (اختیاری)", example="user123456")

class UserDataSchema(BaseModel):
    id: str = Field(..., description="شناسه یکتای کاربر (UUID)")
    phone: str = Field(..., description="شماره همراه")
    name: str = Field(..., description="نام و نام خانوادگی")
    email: Optional[str] = Field(None, description="ایمیل")
    role: str = Field("USER", description="نقش کاربر در سیستم")

class UserAuthResponseSchema(BaseModel):
    token: str = Field(..., description="توکن دسترسی JWT کاربر")
    user: UserDataSchema = Field(..., description="اطلاعات پروفایل کاربر")

# --- Employee Schemas ---
class EmployeeLoginSchema(BaseModel):
    phone: str = Field(..., description="شماره همراه کارمند", example="09129876543")
    password: str = Field(..., description="رمز عبور کارمند", example="emp123456")

class EmployeeAuthResponseSchema(BaseModel):
    token: str = Field(..., description="توکن دسترسی JWT کارمند")
    message: str = Field("ورود کارمند با موفقیت انجام شد", example="ورود کارمند با موفقیت انجام شد")