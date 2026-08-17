# app/schemas/tickets.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TicketCreateSchema(BaseModel):
    title: str = Field(..., description="عنوان تیکت", example="مشکل در ورود به سیستم")
    department: str = Field(..., description="بخش مربوطه", example="پشتیبانی فنی")
    priority: str = Field("medium", description="اولویت: low, medium, high")
    message: str = Field(..., description="متن پیام اولیه")

class GroupTicketCreateSchema(TicketCreateSchema):
    members: List[str] = Field(..., description="لیست ID اعضای گروه")

class TicketMessageCreateSchema(BaseModel):
    message: str = Field(..., description="متن پاسخ یا پیام")
    attachments: Optional[str] = Field(None, description="آدرس فایل پیوست")

class TicketStatusUpdateSchema(BaseModel):
    status: str = Field(..., description="وضعیت جدید: open, pending, answered, closed")

class TicketMessageResponseSchema(BaseModel):
    id: str
    sender_id: str
    message: str
    attachments: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TicketResponseSchema(BaseModel):
    id: str
    title: str
    department: str
    priority: str
    status: str
    creator_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TicketDetailResponseSchema(TicketResponseSchema):
    messages: List[TicketMessageResponseSchema] = []
    members: List[str] = []