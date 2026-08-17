# app/api/v1/messages.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.message import Message
from app.schemas.messages import (
    MessageCreateSchema,
    MessageResponseSchema,
    MessagePaginatedResponseSchema
)

router = APIRouter(prefix="/messages", tags=["فرم تماس فوری و پیام‌ها (Messages)"])


# تابع کمکی برای اعتبارسنجی دسترسی ادمین
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


# ------------------------------------------------------------------
# ۱. ثبت پیام فرم تماس فوری (بدون نیاز به احراز هویت)
# ------------------------------------------------------------------
@router.post(
    "",
    response_model=MessageResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ارسال فرم تماس فوری (عمومی)",
    description="ارسال فرم درخواست پروژه یا تماس توسط کاربران بدون نیاز به لاگین."
)
async def create_message(
    data: MessageCreateSchema,
    db: AsyncSession = Depends(get_db)
):
    new_message = Message(
        name=data.name,
        email=data.email,
        phone=data.phone,
        project_type=data.project_type,
        project_description=data.project_description
    )
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)

    return new_message


# ------------------------------------------------------------------
# ۲. دریافت تمامی پیام‌ها با صفحه‌بندی (ویژه ادمین)
# ------------------------------------------------------------------
@router.get(
    "",
    response_model=MessagePaginatedResponseSchema,
    summary="دریافت لیست تمامی پیام‌های دریافت شده (ویژه ادمین)",
    description="دریافت پیام‌ها با صفحه‌بندی و فیلتر خوانده شده/ نشده."
)
async def get_messages(
    page: int = Query(1, ge=1, description="شماره صفحه"),
    size: int = Query(10, ge=1, le=100, description="تعداد در هر صفحه"),
    is_read: Optional[bool] = Query(None, description="فیلتر بر اساس وضعیت خوانده شده"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(Message)

    if is_read is not None:
        query = query.where(Message.is_read == is_read)

    # محاسبه تعداد کل
    total_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(total_query)
    total = total_res.scalar_one()

    # صفحه‌بندی
    offset = (page - 1) * size
    query = query.order_by(Message.created_at.desc()).offset(offset).limit(size)

    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": items
    }


# ------------------------------------------------------------------
# ۳. دریافت یک پیام بر اساس شناسه (ویژه ادمین)
# ------------------------------------------------------------------
@router.get(
    "/{id}",
    response_model=MessageResponseSchema,
    summary="دریافت جزئیات یک پیام مشخص (ویژه ادمین)",
    description="مشاهده متن کامل پیام و تغییر خودکار وضعیت به خوانده‌شده."
)
async def get_message_by_id(
    id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Message).where(Message.id == id))
    msg = result.scalar_one_or_none()

    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="پیام مورد نظر یافت نشد."
        )

    # علامت‌گذاری خودکار به عنوان خوانده‌شده پس از مشاهده ادمین
    if not msg.is_read:
        msg.is_read = True
        await db.commit()
        await db.refresh(msg)

    return msg


# ------------------------------------------------------------------
# ۴. حذف یک پیام بر اساس شناسه (ویژه ادمین)
# ------------------------------------------------------------------
@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف پیام (ویژه ادمین)",
    description="حذف کامل یک پیام از دیتابیس."
)
async def delete_message(
    id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Message).where(Message.id == id))
    msg = result.scalar_one_or_none()

    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="پیام مورد نظر یافت نشد."
        )

    await db.delete(msg)
    await db.commit()

    return {"message": "پیام با موفقیت حذف شد."}