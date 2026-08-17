#app/api/v1/admin_coupon.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.coupon import Coupon
from app.models.user import User, UserRole
from app.schemas.coupon import CouponCreateRequest, CouponResponse
from app.models.user import User

router = APIRouter(prefix="/admin/coupons", tags=["مدیریت کدهای تخفیف (Admin - Coupons)"])


# تابع کمکی برای اعتبارسنجی دسترسی ادمین
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


@router.post(
    "/",
    response_model=CouponResponse,
    summary="ساخت کد تخفیف جدید",
    status_code=status.HTTP_201_CREATED
)
async def create_coupon(
    data: CouponCreateRequest, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_admin)
):
    # بررسی تکراری نبودن کد
    result = await db.execute(select(Coupon).where(Coupon.code == data.code))
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="این کد تخفیف از قبل وجود دارد.")
        
    new_coupon = Coupon(
        code=data.code,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        max_discount_amount=data.max_discount_amount,
        min_order_amount=data.min_order_amount,
        expires_at=data.expires_at,
        max_uses=data.max_uses,
        max_uses_per_user=data.max_uses_per_user,
        allowed_courses=data.allowed_courses,
        allowed_phones=data.allowed_phones,
        is_active=True
    )
    
    db.add(new_coupon)
    await db.commit()
    await db.refresh(new_coupon)
    return new_coupon


@router.get("/", response_model=List[CouponResponse], summary="لیست تمام کدهای تخفیف")
async def get_all_coupons(
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_admin)
):
    result = await db.execute(select(Coupon).order_by(Coupon.created_at.desc()))
    return result.scalars().all()


@router.patch("/{coupon_id}", summary="غیرفعال کردن یا ویرایش وضعیت کد تخفیف")
async def update_coupon(
    coupon_id: str, 
    is_active: bool, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_admin)
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        raise HTTPException(status_code=404, detail="کد تخفیف یافت نشد.")
        
    coupon.is_active = is_active
    await db.commit()
    return {"message": f"وضعیت کد تخفیف به {is_active} تغییر یافت."}