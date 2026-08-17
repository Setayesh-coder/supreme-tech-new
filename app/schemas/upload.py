# app/schemas/upload.py
from pydantic import BaseModel, Field


class UploadResponseSchema(BaseModel):
    filename: str = Field(..., description="نام فایل ذخیره‌شده روی سرور", examples=["a1b2c3d4e5f67890.png"])
    url: str = Field(..., description="آدرس لینک مستقیم دسترسی به تصویر", examples=["/static/uploads/avatars/a1b2c3d4e5f67890.png"])
    content_type: str = Field(..., description="نوع فایل (MIME Type)", examples=["image/png"])
    size: int = Field(..., description="حجم فایل به بایت", examples=[102400])


class DeleteFileRequestSchema(BaseModel):
    file_url: str = Field(
        ...,
        description="مسیر یا URL کامل فایل جهت حذف",
        examples=["/static/uploads/avatars/a1b2c3d4e5f67890.png"]
    )