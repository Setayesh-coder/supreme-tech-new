from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.event import Event
from app.schemas.events import (
    EventCreateSchema, EventUpdateSchema,
    EventResponseSchema, EventPaginatedResponseSchema
)

router = APIRouter(prefix="/events", tags=["رویدادها (Events)"])


# --------------------------------------------------
# Endpoints عمومی (Public)
# --------------------------------------------------

@router.get(
    "",
    response_model=EventPaginatedResponseSchema,
    summary="دریافت لیست همه رویدادها",
    description="دریافت لیست رویدادها همراه با فیلتر دسته‌بندی، جستجوی عنوان، وضعیت فعال بودن و صفحه‌بندی (عمومی)."
)
async def get_events(
    page: int = Query(1, ge=1, description="شماره صفحه"),
    size: int = Query(10, ge=1, le=100, description="تعداد در هر صفحه"),
    search: Optional[str] = Query(None, description="جستجو در عنوان و توضیحات"),
    category: Optional[str] = Query(None, description="فیلتر بر اساس دسته‌بندی"),
    is_active: Optional[bool] = Query(None, description="فیلتر بر اساس فعال بودن"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Event)

    if is_active is not None:
        query = query.where(Event.is_active == is_active)
    if category:
        query = query.where(Event.category == category)
    if search:
        query = query.where(
            or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%")
            )
        )

    total_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(total_query)
    total = total_res.scalar_one()

    offset = (page - 1) * size
    query = query.order_by(Event.created_at.desc()).offset(offset).limit(size)
    
    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": items
    }


@router.get(
    "/slug/{slug}",
    response_model=EventResponseSchema,
    summary="دریافت جزئیات رویداد بر اساس slug",
    description="دریافت اطلاعات کامل یک رویداد بر اساس نام مستعار (Slug) یکتای URL (عمومی)."
)
async def get_event_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.slug == slug))
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="رویداد مورد نظر یافت نشد."
        )

    return event


# --------------------------------------------------
# Endpoints مخصوص ادمین (Admin Only)
# --------------------------------------------------

@router.get(
    "/{id}",
    response_model=EventResponseSchema,
    summary="دریافت جزئیات رویداد بر اساس ID",
    description="دریافت اطلاعات کامل یک رویداد بر اساس شناسه یکتا (نیازمند دسترسی ادمین)."
)
async def get_event_by_id(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not getattr(current_user, "is_admin", getattr(current_user, "is_superuser", False)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی غیرمجاز. فقط ادمین مجاز است.")

    result = await db.execute(select(Event).where(Event.id == id))
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="رویداد مورد نظر یافت نشد."
        )

    return event


@router.post(
    "",
    response_model=EventResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ایجاد رویداد جدید",
    description="ایجاد رویداد جدید در سیستم (نیازمند دسترسی ادمین)."
)
async def create_event(
    data: EventCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not getattr(current_user, "is_admin", getattr(current_user, "is_superuser", False)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی غیرمجاز. فقط ادمین مجاز است.")

    existing_slug = await db.execute(select(Event).where(Event.slug == data.slug))
    if existing_slug.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="رویدادی با این slug قبلاً ثبت شده است."
        )

    new_event = Event(**data.model_dump())
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)

    return new_event


@router.put(
    "/{id}",
    response_model=EventResponseSchema,
    summary="بروزرسانی رویداد",
    description="ویرایش اطلاعات رویداد موجود بر اساس شناسه (نیازمند دسترسی ادمین)."
)
async def update_event(
    id: str,
    data: EventUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not getattr(current_user, "is_admin", getattr(current_user, "is_superuser", False)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی غیرمجاز. فقط ادمین مجاز است.")

    result = await db.execute(select(Event).where(Event.id == id))
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="رویداد مورد نظر یافت نشد."
        )

    if data.slug and data.slug != event.slug:
        existing_slug = await db.execute(select(Event).where(Event.slug == data.slug))
        if existing_slug.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug وارد شده تکراری است."
            )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)

    await db.commit()
    await db.refresh(event)

    return event


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف رویداد",
    description="حذف فیزیکی رویداد از دیتابیس بر اساس شناسه (نیازمند دسترسی ادمین)."
)
async def delete_event(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not getattr(current_user, "is_admin", getattr(current_user, "is_superuser", False)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی غیرمجاز. فقط ادمین مجاز است.")

    result = await db.execute(select(Event).where(Event.id == id))
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="رویداد مورد نظر یافت نشد."
        )

    await db.delete(event)
    await db.commit()

    return {"message": "رویداد با موفقیت حذف شد."}