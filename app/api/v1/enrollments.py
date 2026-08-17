# app/api/v1/enrollments.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.schemas.enrollments import (
    CoursePreRegisterSchema, EnrollmentResponseSchema,
    EnrollmentStatusUpdateSchema, MeetingLinkSchema
)

router = APIRouter(prefix="/enrollments", tags=["ثبت‌نام‌ها و پیش‌ثبت‌نام (Enrollments)"])


# تابع کمکی ادمین
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


# ------------------------------------------------------------------
# ۱. ثبت فرم پاپ‌آپ و ایجاد پیش‌ثبت‌نام (جهت ورود به سبد خرید)
# ------------------------------------------------------------------
@router.post(
    "/pre-register",
    response_model=EnrollmentResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ثبت فرم نظرسنجی و پیش‌ثبت‌نام دوره",
    description="دریافت اطلاعات پاپ‌آپ کاربر و ایجاد پیش‌ثبت‌نام با وضعیت PENDING."
)
async def pre_register_course(
    data: CoursePreRegisterSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # ۱. بررسی اینکه کاربر قبلاً دوره را قطعی خریداری نکرده باشد
    existing_confirmed = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == data.course_id,
            Enrollment.status == EnrollmentStatus.CONFIRMED
        )
    )
    if existing_confirmed.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شما قبلاً در این دوره ثبت‌نام کرده‌اید و به آن دسترسی دارید."
        )

    # ۲. اگر پیش‌ثبت‌نام PENDING قبلی وجود داشت، همان را به‌روزرسانی می‌کنیم
    existing_pending = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == data.course_id,
            Enrollment.status == EnrollmentStatus.PENDING
        )
    )
    enrollment = existing_pending.scalar_one_or_none()

    if enrollment:
        enrollment.field_of_study = data.field_of_study
        enrollment.university = data.university
        enrollment.has_experience = data.has_experience
        enrollment.experience_level = data.experience_level
        enrollment.has_laptop = data.has_laptop
        enrollment.os_type = data.os_type
        enrollment.goal = data.goal
        enrollment.referral_source = data.referral_source
    else:
        enrollment = Enrollment(
            user_id=current_user.id,
            course_id=data.course_id,
            status=EnrollmentStatus.PENDING,
            field_of_study=data.field_of_study,
            university=data.university,
            has_experience=data.has_experience,
            experience_level=data.experience_level,
            has_laptop=data.has_laptop,
            os_type=data.os_type,
            goal=data.goal,
            referral_source=data.referral_source
        )
        db.add(enrollment)

    await db.commit()
    await db.refresh(enrollment)
    return enrollment


# ------------------------------------------------------------------
# ۲. دریافت دوره‌های فعال کاربر جاری (دوره‌های من)
# ------------------------------------------------------------------
@router.get(
    "/my",
    response_model=List[EnrollmentResponseSchema],
    summary="دریافت لیست دوره‌های خریداری‌شده کاربر جاری",
    description="فقط دوره‌ها و رویدادهایی که وضعیت آن‌ها CONFIRMED (تایید شده) است را برمی‌گرداند."
)
async def get_my_enrollments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.status == EnrollmentStatus.CONFIRMED
        )
    )
    return result.scalars().all()


# ------------------------------------------------------------------
# ۳. دریافت لیست شرکت‌کنندگان یک دوره (ویژه ادمین)
# ------------------------------------------------------------------
@router.get(
    "/course/{courseId}",
    response_model=List[EnrollmentResponseSchema],
    summary="دریافت لیست افراد ثبت‌نام شده در یک دوره مشخص (ویژه ادمین)",
    description="دریافت اطلاعات ثبت‌نام‌شدگان و پاسخ‌های فرم نظرسنجی آن‌ها."
)
async def get_course_enrollments(
    courseId: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(Enrollment).where(Enrollment.course_id == courseId)
    if status_filter:
        query = query.where(Enrollment.status == status_filter)

    result = await db.execute(query)
    return result.scalars().all()


# ------------------------------------------------------------------
# ۴. تغییر وضعیت ثبت‌نام / ثبت لینک جلسه (ویژه ادمین)
# ------------------------------------------------------------------
@router.patch(
    "/{id}/status",
    response_model=EnrollmentResponseSchema,
    summary="به‌روزرسانی وضعیت ثبت‌نام (ویژه ادمین)"
)
async def update_enrollment_status(
    id: str,
    payload: EnrollmentStatusUpdateSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Enrollment).where(Enrollment.id == id))
    enrollment = result.scalar_one_or_none()

    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ثبت‌نام یافت نشد.")

    enrollment.status = payload.status
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


@router.post(
    "/{id}/meeting-link",
    response_model=EnrollmentResponseSchema,
    summary="ثبت لینک جلسه آنلاین (ویژه ادمین)"
)
async def set_meeting_link(
    id: str,
    payload: MeetingLinkSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Enrollment).where(Enrollment.id == id))
    enrollment = result.scalar_one_or_none()

    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ثبت‌نام یافت نشد.")

    enrollment.meeting_link = str(payload.meeting_link)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف / لغو ثبت‌نام"
)
async def delete_enrollment(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Enrollment).where(Enrollment.id == id, Enrollment.user_id == current_user.id)
    )
    enrollment = result.scalar_one_or_none()

    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ثبت‌نام یافت نشد.")

    await db.delete(enrollment)
    await db.commit()
    return {"message": "ثبت‌نام با موفقیت لغو شد."}