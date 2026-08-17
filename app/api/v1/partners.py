from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.partner import Partner
from app.schemas.partners import (
    PartnerCreateSchema, PartnerUpdateSchema, PartnerResponseSchema
)

router = APIRouter(prefix="/partners", tags=["شرکا و همکاران (Partners)"])


# تابع کمکی برای بررسی دسترسی ادمین
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


# ------------------------------------------------------------------
# ۱. دریافت لیست همکاران (عمومی - بدون نیاز به توکن)
# ------------------------------------------------------------------
@router.get(
    "",
    response_model=List[PartnerResponseSchema],
    summary="دریافت لیست تمامی شرکا / همکاران فعال",
    description="دریافت لیست همکاران عمومی جهت نمایش در صفحه اصلی. به صورت پیش‌فرض فقط آیتم‌های فعال برمی‌گردند."
)
async def get_partners(
    isActive: Optional[bool] = Query(True, alias="isActive", description="فیلتر بر اساس فعال بودن (پیش‌فرض true)"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Partner)

    if isActive is not None:
        query = query.where(Partner.is_active == isActive)

    query = query.order_by(Partner.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


# ------------------------------------------------------------------
# ۲. دریافت اطلاعات یک همکار مشخص (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.get(
    "/{id}",
    response_model=PartnerResponseSchema,
    summary="دریافت اطلاعات یک همکار مشخص",
    description="دریافت اطلاعات کامل همکار بر اساس شناسه ID (نیازمند دسترسی ادمین)."
)
async def get_partner_by_id(
    id: str,
    admin: User = Depends(get_current_admin),  # ارتقا به دسترسی ادمین
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Partner).where(Partner.id == id))
    partner = result.scalar_one_or_none()

    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="همکار مورد نظر یافت نشد."
        )

    return partner


# ------------------------------------------------------------------
# ۳. افزودن همکار جدید (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.post(
    "",
    response_model=PartnerResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="افزودن همکار جدید",
    description="افزودن یک شریک تجاری یا همکار جدید به سیستم (نیازمند دسترسی ادمین)."
)
async def create_partner(
    data: PartnerCreateSchema,
    admin: User = Depends(get_current_admin),  # ارتقا به دسترسی ادمین
    db: AsyncSession = Depends(get_db)
):
    new_partner = Partner(**data.model_dump())
    db.add(new_partner)
    await db.commit()
    await db.refresh(new_partner)

    return new_partner


# ------------------------------------------------------------------
# ۴. به‌روزرسانی اطلاعات همکار (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.put(
    "/{id}",
    response_model=PartnerResponseSchema,
    summary="به‌روزرسانی اطلاعات همکار",
    description="ویرایش اطلاعات همکار بر اساس شناسه (نیازمند دسترسی ادمین)."
)
async def update_partner(
    id: str,
    data: PartnerUpdateSchema,
    admin: User = Depends(get_current_admin),  # ارتقا به دسترسی ادمین
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Partner).where(Partner.id == id))
    partner = result.scalar_one_or_none()

    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="همکار مورد نظر یافت نشد."
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(partner, key, value)

    await db.commit()
    await db.refresh(partner)

    return partner


# ------------------------------------------------------------------
# ۵. حذف همکار (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف همکار",
    description="حذف کامل همکار از دیتابیس بر اساس شناسه (نیازمند دسترسی ادمین)."
)
async def delete_partner(
    id: str,
    admin: User = Depends(get_current_admin),  # ارتقا به دسترسی ادمین
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Partner).where(Partner.id == id))
    partner = result.scalar_one_or_none()

    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="همکار مورد نظر یافت نشد."
        )

    await db.delete(partner)
    await db.commit()

    return {"message": "همکار با موفقیت حذف شد."}