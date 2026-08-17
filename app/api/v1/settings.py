from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.setting import SystemSetting
from app.schemas.settings import (
    PublicSettingsSchema,
    AdminSettingsSchema,
    SettingsUpdateSchema
)

router = APIRouter(prefix="/settings", tags=["تنظیمات (Settings)"])

# مقادیر پیش‌فرض سیستم
DEFAULT_SETTINGS = {
    "site_title": "سپریم تک",
    "site_description": "سامانه پیشرفته هوافضا و فناوری",
    "contact_email": "info@supremetech.ir",
    "contact_phone": "02112345678",
    "address": "تهران، دانشگاه آزاد اسلامی واحد تهران مرکزی",
    "logo_url": "/images/logo.png",
    "maintenance_mode": "false",
    "telegram_url": "",
    "instagram_url": "",
    "telegram_support_url": "",
    "address_link": "",
    "max_upload_size_mb": "10",
    "enable_user_registration": "true",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": "587",
    "smtp_user": ""
}


# بررسی دسترسی ادمین
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


# تابع کمکی برای خواندن تمامی تنظیمات از دیتابیس و تبدیل تایپ‌ها
async def get_settings_dict_from_db(db: AsyncSession) -> Dict[str, Any]:
    result = await db.execute(select(SystemSetting))
    db_records = {item.key: item.value for item in result.scalars().all()}
    
    # ترکیب تنظیمات دیتابیس با مقادیر پیش‌فرض
    merged = DEFAULT_SETTINGS.copy()
    merged.update({k: v for k, v in db_records.items() if v is not None})

    return {
        "site_title": merged.get("site_title", "سپریم تک"),
        "site_description": merged.get("site_description", ""),
        "contact_email": merged.get("contact_email"),
        "contact_phone": merged.get("contact_phone"),
        "address": merged.get("address"),
        "logo_url": merged.get("logo_url"),
        "maintenance_mode": str(merged.get("maintenance_mode")).lower() == "true",
        "telegram_url": merged.get("telegram_url"),
        "instagram_url": merged.get("instagram_url"),
        "telegram_support_url": merged.get("telegram_support_url"),
        "address_link": merged.get("address_link"),
        "max_upload_size_mb": int(merged.get("max_upload_size_mb", 10)),
        "enable_user_registration": str(merged.get("enable_user_registration")).lower() == "true",
        "smtp_host": merged.get("smtp_host"),
        "smtp_port": int(merged.get("smtp_port")) if merged.get("smtp_port") else None,
        "smtp_user": merged.get("smtp_user")
    }


# ------------------------------------------------------------------
# ۱. دریافت تنظیمات عمومی (پابلیک - بدون نیاز به توکن)
# ------------------------------------------------------------------
@router.get(
    "/public",
    response_model=PublicSettingsSchema,
    summary="Get Public Settings",
    description="دریافت تنظیمات عمومی جهت نمایش در فرانت‌اند."
)
async def get_public_settings(db: AsyncSession = Depends(get_db)):
    settings = await get_settings_dict_from_db(db)
    return PublicSettingsSchema(**settings)


# ------------------------------------------------------------------
# ۲. دریافت تمامی تنظیمات (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.get(
    "/",
    response_model=AdminSettingsSchema,
    summary="Get All Settings",
    description="دریافت کلیه تنظیمات عمومی و مدیریتی سیستم (نیازمند دسترسی ادمین)."
)
async def get_all_settings(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    settings = await get_settings_dict_from_db(db)
    return AdminSettingsSchema(**settings)


# ------------------------------------------------------------------
# ۳. بروزرسانی تنظیمات (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.put(
    "/",
    response_model=AdminSettingsSchema,
    summary="Update Settings",
    description="بروزرسانی مشخصات و تنظیمات سیستم (نیازمند دسترسی ادمین)."
)
async def update_settings(
    data: SettingsUpdateSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        if value is None:
            continue

        str_value = str(value).lower() if isinstance(value, bool) else str(value)
        
        result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
        setting_obj = result.scalar_one_or_none()

        if setting_obj:
            setting_obj.value = str_value
        else:
            new_setting = SystemSetting(key=key, value=str_value, category="general")
            db.add(new_setting)

    await db.commit()

    updated_settings = await get_settings_dict_from_db(db)
    return AdminSettingsSchema(**updated_settings)


# ------------------------------------------------------------------
# ۴. بازنشانی تنظیمات به پیش‌فرض (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.post(
    "/reset",
    response_model=AdminSettingsSchema,
    summary="Reset Settings",
    description="بازنشانی تمامی تنظیمات سیستم به مقادیر اولیه دیتابیس (نیازمند دسترسی ادمین)."
)
async def reset_settings(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(delete(SystemSetting))
    await db.flush()

    new_settings = [
        SystemSetting(key=key, value=str(value), category="general")
        for key, value in DEFAULT_SETTINGS.items()
    ]
    db.add_all(new_settings)

    await db.commit()

    updated_settings = await get_settings_dict_from_db(db)
    return AdminSettingsSchema(**updated_settings)