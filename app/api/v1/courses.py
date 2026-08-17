from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.course import Course
from app.schemas.courses import (
    CourseCreateSchema, CourseUpdateSchema, CourseResponseSchema, CoursePaginatedResponseSchema
)

router = APIRouter(prefix="/courses", tags=["دوره‌ها (Courses)"])


# --------------------------------------------------
# Endpoints عمومی (Public)
# --------------------------------------------------

@router.get(
    "",
    response_model=CoursePaginatedResponseSchema,
    summary="دریافت لیست تمام دوره‌ها",
    description="""
    ## لیست کامل دوره‌های آموزشی
    امکان دریافت دوره‌ها به همراه **صفحه‌بندی (Pagination)** و فیلتر بر اساس **eventId** و **isActive** (عمومی).
    """
)
async def get_courses(
    eventId: Optional[str] = Query(None, description="فیلتر بر اساس شناسه رویداد مرتبط"),
    page: int = Query(1, ge=1, description="شماره صفحه"),
    limit: int = Query(10, ge=1, le=100, description="تعداد در هر صفحه"),
    isActive: Optional[bool] = Query(None, description="فیلتر بر اساس وضعیت فعال/غیرفعال بودن دوره"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Course)

    if eventId:
        query = query.where(Course.event_id == eventId)
    
    if isActive is not None:
        query = query.where(Course.is_active == isActive)

    # محاسبه تعداد کل
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    # اعمال صفحه‌بندی
    offset = (page - 1) * limit
    query = query.order_by(Course.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    courses = result.scalars().all()

    return {
        "items": courses,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get(
    "/slug/{slug}",
    response_model=CourseResponseSchema,
    summary="دریافت جزئیات دوره بر اساس اسلاگ (Slug)",
    description="جستجو و دریافت جزئیات یک دوره خاص با استفاده از عنوان یکتای URL (عمومی)."
)
async def get_course_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.slug == slug))
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="دوره مورد نظر یافت نشد."
        )

    return course


# --------------------------------------------------
# Endpoints مخصوص ادمین (Admin Only)
# --------------------------------------------------

@router.get(
    "/{id}",
    response_model=CourseResponseSchema,
    summary="دریافت جزئیات دوره بر اساس ID",
    description="جستجو و دریافت اطلاعات کامل یک دوره بر اساس شناسه منحصر به فرد (نیازمند دسترسی ادمین)."
)
async def get_course_by_id(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not getattr(current_user, "is_admin", getattr(current_user, "is_superuser", False)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی غیرمجاز. فقط ادمین مجاز است.")

    result = await db.execute(select(Course).where(Course.id == id))
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="دوره مورد نظر یافت نشد."
        )

    return course


@router.post(
    "",
    response_model=CourseResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ایجاد دوره جدید",
    description="""
    ## ثبت دوره جدید در سیستم
    نیازمند **احراز هویت ادمین** (ارسال Bearer Token معتبر).
    """
)
async def create_course(
    data: CourseCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not getattr(current_user, "is_admin", getattr(current_user, "is_superuser", False)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی غیرمجاز. فقط ادمین مجاز است.")

    # بررسی یکتا بودن Slug
    existing_slug = await db.execute(select(Course).where(Course.slug == data.slug))
    if existing_slug.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="دوره‌ای با این اسلاگ (Slug) قبلاً ثبت شده است."
        )

    new_course = Course(
        title=data.title,
        slug=data.slug,
        description=data.description,
        cover_image=data.cover_image,
        price=data.price,
        duration_hours=data.duration_hours,
        instructor_name=data.instructor_name,
        is_active=data.is_active if data.is_active is not None else True,
        event_id=data.event_id
    )

    db.add(new_course)
    await db.commit()
    await db.refresh(new_course)

    return new_course


@router.put(
    "/{id}",
    response_model=CourseResponseSchema,
    summary="بروزرسانی دوره",
    description="ویرایش مشخصات یک دوره بر اساس شناسه (نیازمند احراز هویت ادمین)."
)
async def update_course(
    id: str,
    data: CourseUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not getattr(current_user, "is_admin", getattr(current_user, "is_superuser", False)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="دسترسی غیرمجاز. فقط ادمین مجاز است."
        )

    result = await db.execute(select(Course).where(Course.id == id))
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="دوره مورد نظر یافت نشد."
        )

    # بررسی یکتا بودن اسلاگ در صورت تغییر
    if data.slug and data.slug != course.slug:
        existing_slug = await db.execute(select(Course).where(Course.slug == data.slug))
        if existing_slug.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="این اسلاگ قبلاً برای دوره دیگری استفاده شده است."
            )

    # استخراج فقط فیلدهایی که در Request Body ارسال شده‌اند
    # اگر از Pydantic v1 استفاده می‌کنید به جای model_dump از data.dict(exclude_unset=True) استفاده کنید
    update_data = data.model_dump(exclude_unset=True)

    # اعمال تغییرات روی مدل دیتابیس
    for field, value in update_data.items():
        setattr(course, field, value)

    await db.commit()
    await db.refresh(course)

    return course


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف دوره",
    description="حذف فیزیکی یک دوره از دیتابیس بر اساس ID (نیازمند احراز هویت ادمین)."
)
async def delete_course(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not getattr(current_user, "is_admin", getattr(current_user, "is_superuser", False)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی غیرمجاز. فقط ادمین مجاز است.")

    result = await db.execute(select(Course).where(Course.id == id))
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="دوره مورد نظر یافت نشد."
        )

    await db.delete(course)
    await db.commit()

    return {"message": "دوره آموزشی با موفقیت حذف شد."}