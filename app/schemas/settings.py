# app/schemas/settings.py
from pydantic import BaseModel, Field
from typing import Optional

class PublicSettingsSchema(BaseModel):
    site_title: str = Field("سپریم تک", description="عنوان سایت")
    site_description: str = Field("سامانه پیشرفته هوافضا و فناوری", description="توضیحات کوتاه سایت")
    contact_email: Optional[str] = Field("info@supremetech.ir", description="ایمیل تماس")
    contact_phone: Optional[str] = Field("02112345678", description="شماره تماس")
    address: Optional[str] = Field("تهران، دانشگاه آزاد اسلامی واحد تهران مرکزی", description="آدرس")
    logo_url: Optional[str] = Field("/images/logo.png", description="لوگو")
    maintenance_mode: bool = Field(False, description="حالت در دست تعمیر")
    # فیلدهای جدید شبکه اجتماعی و ارتباطی
    telegram_url: Optional[str] = Field(None, description="لینک کانال تلگرام")
    instagram_url: Optional[str] = Field(None, description="لینک پیج اینستاگرام")
    telegram_support_url: Optional[str] = Field(None, description="لینک پشتیبانی تلگرام")
    address_link: Optional[str] = Field(None, description="لینک مسیریابی یا آدرس")

class AdminSettingsSchema(PublicSettingsSchema):
    max_upload_size_mb: int = Field(10, description="حداکثر حجم آپلود به مگابایت")
    enable_user_registration: bool = Field(True, description="اجازه ثبت‌نام کاربران جدید")
    smtp_host: Optional[str] = Field("smtp.gmail.com", description="آدرس سرور SMTP")
    smtp_port: Optional[int] = Field(587, description="پورت سرور SMTP")
    smtp_user: Optional[str] = Field(None, description="نام کاربری ایمیل")

class SettingsUpdateSchema(BaseModel):
    site_title: Optional[str] = None
    site_description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    telegram_url: Optional[str] = None
    instagram_url: Optional[str] = None
    telegram_support_url: Optional[str] = None
    address_link: Optional[str] = None
    max_upload_size_mb: Optional[int] = None
    enable_user_registration: Optional[bool] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None