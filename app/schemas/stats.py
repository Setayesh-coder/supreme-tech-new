# app/schemas/stats.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class RecordViewSchema(BaseModel):
    path: str = Field(..., description="مسیر/آدرس صفحه بازدید شده", example="/events/aerospace-conf")
    referrer: Optional[str] = Field(None, description="صفحه ارجاع‌دهنده")
    userAgent: Optional[str] = Field(None, alias="user_agent", description="مشخصات مرورگر/دستگاه")
    ip: Optional[str] = Field(None, alias="ip_address", description="آدرس IP کاربر")
    sessionId: Optional[str] = Field(None, alias="session_id", description="شناسه نشست کاربر")

    class Config:
        populate_by_name = True

class StatsOverviewSchema(BaseModel):
    total_views: int = Field(..., description="کل بازدیدها")
    unique_visitors: int = Field(..., description="تعداد بازدیدکنندگان یکتا")
    total_events: int = Field(..., description="تعداد کل رویدادها")
    total_messages: int = Field(..., description="تعداد کل پیام‌های پشتیبانی")
    unread_messages: int = Field(..., description="پیام‌های خوانده‌نشده")

class DailyStatItemSchema(BaseModel):
    date: str
    views: int
    unique_visitors: int

class PageStatItemSchema(BaseModel):
    path: str
    views: int
    percentage: float