# app/schemas/partners.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PartnerCreateSchema(BaseModel):
    name: str = Field(..., description="نام همکار / شریک تجاری", example="دانشگاه صنعتی شریف")
    logo: str = Field(..., description="آدرس تصویر لوگو", example="/uploads/partners/sharif_logo.png")
    website_url: Optional[str] = Field(None, description="آدرس وب‌سایت همکار", example="https://sharif.edu")
    description: Optional[str] = Field(None, description="توضیحات کوتاه درباره همکار")
    is_active: Optional[bool] = Field(True, description="وضعیت فعال/غیرفعال")

class PartnerUpdateSchema(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class PartnerResponseSchema(BaseModel):
    id: str
    name: str
    logo: str
    website_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True