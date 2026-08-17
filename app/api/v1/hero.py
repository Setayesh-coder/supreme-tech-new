from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.hero import HeroSlide
from app.schemas.hero import (
    HeroSlideCreateSchema, HeroSlideUpdateSchema,
    HeroSlideResponseSchema, HeroReorderSchema
)

router = APIRouter(prefix="/hero", tags=["هیرو و اسلایدر (Hero)"])


# تابع کمکی برای بررسی دسترسی ادمین
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


@router.get(
    "",
    response_model=List[HeroSlideResponseSchema],
    summary="دریافت لیست تمام آیتم‌های هیرو / اسلایدر",
    description="دریافت لیست اسلایدرها به ترتیب `order` جهت نمایش در صفحه اصلی."
)
async def get_hero_slides(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HeroSlide).order_by(HeroSlide.order.asc(), HeroSlide.created_at.desc())
    )
    return result.scalars().all()


@router.get(
    "/{id}",
    response_model=HeroSlideResponseSchema,
    summary="دریافت اطلاعات یک آیتم هیرو مشخص",
    description="دریافت جزئیات اسلاید بر اساس شناسه ID."
)
async def get_hero_slide_by_id(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeroSlide).where(HeroSlide.id == id))
    slide = result.scalar_one_or_none()

    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="آیتم هیرو مورد نظر یافت نشد."
        )

    return slide


@router.post(
    "",
    response_model=HeroSlideResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ایجاد آیتم جدید در هیرو",
    description="افزودن اسلاید جدید به بنر اصلی (نیازمند دسترسی ادمین)."
)
async def create_hero_slide(
    data: HeroSlideCreateSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    new_slide = HeroSlide(**data.model_dump())
    db.add(new_slide)
    await db.commit()
    await db.refresh(new_slide)

    return new_slide


@router.put(
    "/reorder",
    status_code=status.HTTP_200_OK,
    summary="تغییر مرتب‌سازی و اولویت نمایش آیتم‌های هیرو",
    description="بروزرسانی دسته‌ای ترتیب نمایش (order) اسلایدها جهت پشتیبانی از Drag & Drop."
)
async def reorder_hero_slides(
    payload: HeroReorderSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    for item in payload.items:
        result = await db.execute(select(HeroSlide).where(HeroSlide.id == item.id))
        slide = result.scalar_one_or_none()
        if slide:
            slide.order = item.order

    await db.commit()
    return {"message": "ترتیب نمایش اسلایدها با موفقیت بروزرسانی شد."}


@router.put(
    "/{id}",
    response_model=HeroSlideResponseSchema,
    summary="ویرایش اطلاعات یک آیتم هیرو",
    description="ویرایش بنر/اسلاید بر اساس شناسه (نیازمند دسترسی ادمین)."
)
async def update_hero_slide(
    id: str,
    data: HeroSlideUpdateSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(HeroSlide).where(HeroSlide.id == id))
    slide = result.scalar_one_or_none()

    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="آیتم هیرو مورد نظر یافت نشد."
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(slide, key, value)

    await db.commit()
    await db.refresh(slide)

    return slide


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف یک آیتم هیرو",
    description="حذف اسلاید از دیتابیس بر اساس شناسه (نیازمند دسترسی ادمین)."
)
async def delete_hero_slide(
    id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(HeroSlide).where(HeroSlide.id == id))
    slide = result.scalar_one_or_none()

    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="آیتم هیرو مورد نظر یافت نشد."
        )

    await db.delete(slide)
    await db.commit()

    return {"message": "آیتم هیرو با موفقیت حذف شد."}