import math
from typing import Optional
from fastapi import APIRouter, status, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.core.database import get_db
from app.core.security import get_current_user, verify_password, hash_password
from app.models.user import User, UserRole
from app.schemas.users import (
    UserCreateSchema,
    UserUpdateSchema,
    UserRoleUpdateSchema,
    UserResponseSchema,
    UserPaginatedResponseSchema,
    ChangePasswordSchema
)

router = APIRouter(prefix="/users", tags=["مدیریت کاربران (Users)"])


# تابع کمکی برای اعتبارسنجی دسترسی ادمین
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


# ------------------------------------------------------------------
# ۱. دریافت پروفایل شخصی کاربر لاگین شده
# ------------------------------------------------------------------
@router.get(
    "/me",
    summary="دریافت اطلاعات پروفایل خود کاربر",
    response_model=UserResponseSchema
)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


# ------------------------------------------------------------------
# ۲. ویرایش پروفایل شخصی کاربر لاگین شده
# ------------------------------------------------------------------
@router.patch(
    "/me",
    summary="ویرایش اطلاعات پروفایل خود کاربر",
    response_model=UserResponseSchema
)
async def update_my_profile(
    data: UserUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    
    # اطمینان امنیتی از عدم تغییر نقش یا وضعیت توسط خود کاربر
    update_data.pop("role", None)
    update_data.pop("is_active", None)
    update_data.pop("password", None)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user


# ------------------------------------------------------------------
# ۳. تغییر پسورد توسط خود کاربر
# ------------------------------------------------------------------
@router.post(
    "/me/change-password",
    summary="تغییر رمز عبور خود کاربر",
    status_code=status.HTTP_200_OK
)
async def change_my_password(
    data: ChangePasswordSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="رمز عبور فعلی نادرست است."
        )

    current_user.password_hash = hash_password(data.new_password)
    
    await db.commit()
    return {"message": "رمز عبور با موفقیت تغییر یافت."}


# ------------------------------------------------------------------
# ۴. دریافت لیست تمامی کاربران با صفحه‌بندی و جستجو (ویژه ادمین)
# ------------------------------------------------------------------
@router.get(
    "",
    summary="دریافت لیست کاربران (ویژه ادمین)",
    response_model=UserPaginatedResponseSchema,
    dependencies=[Depends(get_current_admin)]
)
async def get_all_users(
    page: int = Query(1, ge=1, description="شماره صفحه"),
    limit: int = Query(10, ge=1, le=100, description="تعداد آیتم در هر صفحه"),
    search: Optional[str] = Query(None, description="عبارت جستجو (نام، شماره تلفن یا ایمیل)"),
    db: AsyncSession = Depends(get_db)
):
    query = select(User)

    if search:
        search_fmt = f"%{search}%"
        query = query.where(
            or_(
                User.name.ilike(search_fmt),
                User.phone.ilike(search_fmt),
                User.email.ilike(search_fmt)
            )
        )

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar_one()

    offset = (page - 1) * limit
    users_query = query.offset(offset).limit(limit)
    result = await db.execute(users_query)
    users = result.scalars().all()

    pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "items": users,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }


# ------------------------------------------------------------------
# ۵. دریافت جزئیات یک کاربر با شناسه (ویژه ادمین)
# ------------------------------------------------------------------
@router.get(
    "/{id}",
    summary="دریافت جزئیات کاربر با شناسه (ویژه ادمین)",
    response_model=UserResponseSchema,
    dependencies=[Depends(get_current_admin)]
)
async def get_user_by_id(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربری با این شناسه یافت نشد."
        )
    return user


# ------------------------------------------------------------------
# ۶. تغییر سطح دسترسی / نقش کاربر (ویژه ادمین)
# ------------------------------------------------------------------
@router.patch(
    "/{id}/role",
    summary="تغییر نقش کاربری (ویژه ادمین)",
    response_model=UserResponseSchema,
    dependencies=[Depends(get_current_admin)]
)
async def update_user_role(
    id: str,
    data: UserRoleUpdateSchema,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربری با این شناسه یافت نشد."
        )

    user.role = data.role
    await db.commit()
    await db.refresh(user)
    return user


# ------------------------------------------------------------------
# ۷. فعال یا غیرفعال کردن کاربر (ویژه ادمین)
# ------------------------------------------------------------------
@router.patch(
    "/{id}/toggle-active",
    summary="فعال یا غیرفعال کردن حساب کاربر (ویژه ادمین)",
    response_model=UserResponseSchema,
    dependencies=[Depends(get_current_admin)]
)
async def toggle_user_active(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربری با این شناسه یافت نشد."
        )

    user.is_active = not user.is_active
    await db.commit()
    await db.refresh(user)
    return user


# ------------------------------------------------------------------
# ۸. حذف کاربر (ویژه ادمین)
# ------------------------------------------------------------------
@router.delete(
    "/{id}",
    summary="حذف کاربر (ویژه ادمین)",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_admin)]
)
async def delete_user(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربری با این شناسه یافت نشد."
        )

    await db.delete(user)
    await db.commit()
    return None