# app/schemas/message.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

class MessageCreateSchema(BaseModel):
    name: str = Field(..., description="نام و نام خانوادگی", example="علی رضایی")
    email: EmailStr = Field(..., description="ایمیل فرستنده", example="ali@example.com")
    phone: Optional[str] = Field(None, description="شماره تماس", example="09123456789")
    project_type: Optional[str] = Field(None, description="نوع پروژه", example="طراحی وب‌سایت")
    project_description: str = Field(..., description="توضیحات پروژه")

class MessageResponseSchema(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    project_type: Optional[str] = None
    project_description: str
    is_read: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MessagePaginatedResponseSchema(BaseModel):
    total: int
    page: int
    size: int
    items: List[MessageResponseSchema]