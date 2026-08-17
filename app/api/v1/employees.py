from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.employees import Employee
from app.schemas.employees import (
    EmployeeCreateSchema, EmployeeUpdateSchema,
    EmployeePublicResponseSchema, EmployeeDetailResponseSchema
)

router = APIRouter(prefix="/employees", tags=["کارمندان (Employees)"])


# تابع کمکی برای بررسی دسترسی ادمین
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


# ------------------------------------------------------------------
# ۱. دریافت لیست عمومی کارمندان
# ------------------------------------------------------------------
@router.get(
    "/public",
    response_model=List[EmployeePublicResponseSchema],
    summary="دریافت لیست عمومی کارمندان",
    description="دریافت لیست عمومی کارمندان فعال جهت نمایش در وب‌سایت."
)
async def get_public_employees(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Employee).where(Employee.is_active == True).order_by(Employee.created_at.desc())
    )
    employees = result.scalars().all()

    return [
        {
            "id": emp.id,
            "name": emp.name,
            "department": emp.department,
            "position": emp.position,
            "avatar": emp.avatar
        }
        for emp in employees
    ]


# ------------------------------------------------------------------
# ۲. دریافت جزئیات یک کارمند (ویژه ادمین)
# ------------------------------------------------------------------
@router.get(
    "/{id}",
    response_model=EmployeeDetailResponseSchema,
    summary="دریافت جزئیات یک کارمند مشخص",
    description="دریافت کامل پروفایل یک کارمند بر اساس شناسه (ویژه ادمین)."
)
async def get_employee_by_id(
    id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Employee).where(Employee.id == id))
    employee = result.scalar_one_or_none()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کارمند مورد نظر یافت نشد."
        )

    return employee


# ------------------------------------------------------------------
# ۳. ایجاد کارمند جدید (اتصال به جدول Users)
# ------------------------------------------------------------------
@router.post(
    "",
    response_model=EmployeeDetailResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ایجاد کارمند جدید از روی کاربر موجود",
    description="ثبت کارمند جدید بر اساس شماره تماس کاربری که قبلاً در سیستم ثبت‌نام کرده است."
)
async def create_employee(
    data: EmployeeCreateSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    # ۱. بررسی اینکه آیا قبلاً این شماره کارمند شده است یا خیر
    existing_emp = await db.execute(select(Employee).where(Employee.phone == data.phone))
    if existing_emp.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="این کاربر قبلاً به عنوان کارمند ثبت شده است."
        )

    # ۲. بررسی یکتا بودن کد ملی در صورت ارسال
    if data.national_id:
        existing_nid = await db.execute(select(Employee).where(Employee.national_id == data.national_id))
        if existing_nid.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="کارمندی با این کد ملی قبلاً ثبت شده است."
            )

    # ۳. جستجوی کاربر در جدول کاربران (users)
    user_result = await db.execute(select(User).where(User.phone == data.phone))
    target_user = user_result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربری با این شماره همراه هنوز در سیستم ثبت‌نام نکرده است."
        )

    # ۴. ساخت رکورد جدید کارمند با استخراج اطلاعات از جدول User
    new_employee = Employee(
        name=getattr(target_user, "full_name", None) or getattr(target_user, "name", "کارمند"),
        phone=target_user.phone,
        email=target_user.email,
        password_hash=target_user.hashed_password if hasattr(target_user, "hashed_password") else getattr(target_user, "password_hash", ""),
        role=data.role.value if data.role else "EMPLOYEE",
        department=data.department,
        position=data.position,
        national_id=data.national_id,
        avatar=getattr(target_user, "avatar", None),
        is_active=True
    )

    db.add(new_employee)
    await db.commit()
    await db.refresh(new_employee)

    return new_employee


# ------------------------------------------------------------------
# ۴. ویرایش اطلاعات کارمند (ویژه ادمین)
# ------------------------------------------------------------------
@router.put(
    "/{id}",
    response_model=EmployeeDetailResponseSchema,
    summary="ویرایش اطلاعات کارمند",
    description="بروزرسانی مشخصات سازمانی کارمند (نیازمند دسترسی ادمین)."
)
async def update_employee(
    id: str,
    data: EmployeeUpdateSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Employee).where(Employee.id == id))
    employee = result.scalar_one_or_none()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کارمند مورد نظر یافت نشد."
        )

    # بررسی عدم تداخل کد ملی
    if data.national_id and data.national_id != employee.national_id:
        existing_nid = await db.execute(select(Employee).where(Employee.national_id == data.national_id))
        if existing_nid.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="کد ملی وارد شده تکراری است."
            )
        employee.national_id = data.national_id

    if data.role is not None: employee.role = data.role.value
    if data.department is not None: employee.department = data.department
    if data.position is not None: employee.position = data.position
    if data.is_active is not None: employee.is_active = data.is_active

    await db.commit()
    await db.refresh(employee)

    return employee


# ------------------------------------------------------------------
# ۵. حذف کارمند (ویژه ادمین)
# ------------------------------------------------------------------
@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف کارمند",
    description="حذف پرونده کارمند از سیستم بدون آسیب به حساب کاربری وی در جدول کاربران."
)
async def delete_employee(
    id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Employee).where(Employee.id == id))
    employee = result.scalar_one_or_none()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کارمند مورد نظر یافت نشد."
        )

    await db.delete(employee)
    await db.commit()

    return {"message": "اطلاعات کارمند با موفقیت حذف شد."}