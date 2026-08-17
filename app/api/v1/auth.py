from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User, UserRole
from app.models.employees import Employee
from app.schemas.auth import (
    AdminLoginSchema, AdminRegisterSchema, AdminAuthResponseSchema, ChangePasswordSchema,
    UserRegisterSchema, UserLoginSchema, UserAuthResponseSchema, UserDataSchema,
    EmployeeLoginSchema, EmployeeAuthResponseSchema
)

router = APIRouter(tags=["احراز هویت (Auth)"])

# ==========================================
# ۱. بخش مدیران (Admin Auth)
# ==========================================

@router.post(
    "/admin/login",
    response_model=AdminAuthResponseSchema,
    summary="ورود مدیران سیستم",
    description="""
    ## ورود مدیر ارشد به سامانه
    این اندپوئینت برای احراز هویت مدیران سیستم از جدول کاربران استفاده می‌کند.
    """
)
async def login_admin(data: AdminLoginSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="شماره همراه یا رمز عبور مدیر اشتباه است."
        )

    # بررسی نقش کاربر
    if user.role != UserRole.ADMIN and not getattr(user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای ورود به پنل مدیریت را ندارید."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="حساب کاربری شما غیرفعال شده است."
        )

    role_str = str(user.role.value if hasattr(user.role, 'value') else user.role)
    token = create_access_token(data={"sub": str(user.id), "phone": user.phone, "role": role_str})
    
    return {
        "token": token,
        "message": "ورود مدیر با موفقیت انجام شد",
        "adminId": str(user.id)
    }


@router.post(
    "/admin/register",
    response_model=AdminAuthResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ثبت‌نام مدیر جدید (محافظت‌شده)",
    description="""
    ## ثبت حساب مدیریت جدید
    تنها مدیران فعال سیستم با داشتن توکن معتبر اجازه ساخت مدیر جدید را دارند.
    """
)
async def register_admin(
    data: AdminRegisterSchema,
    current_user: User = Depends(get_current_user),  # <--- محافظت با توکن
    db: AsyncSession = Depends(get_db)
):
    # بررسی سطح دسترسی کاربر درخواست‌دهنده
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما مجاز به ایجاد حساب مدیریت جدید نیستید."
        )

    existing = await db.execute(select(User).where(User.phone == data.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="کاربری با این شماره همراه قبلاً ثبت شده است."
        )

    new_admin = User(
        phone=data.phone,
        name=data.name,
        password_hash=hash_password(data.password),
        role=UserRole.ADMIN
    )
    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)

    role_str = str(new_admin.role.value if hasattr(new_admin.role, 'value') else new_admin.role)
    token = create_access_token(data={"sub": str(new_admin.id), "phone": new_admin.phone, "role": role_str})
    
    return {
        "token": token,
        "message": "حساب مدیر با موفقیت ایجاد شد",
        "adminId": str(new_admin.id)
    }


@router.patch(
    "/admin/change-password",
    summary="تغییر رمز عبور کاربر جاری",
    description="""
    ## تغییر رمز عبور حساب جاری
    نیاز به ارسال توکن معتبر دارد.
    """
)
async def change_password(
    data: ChangePasswordSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.password_hash or not verify_password(data.current, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="رمز عبور فعلی اشتباه است."
        )

    current_user.password_hash = hash_password(data.new)
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {"message": "رمز عبور با موفقیت تغییر یافت."}


# ==========================================
# ۲. بخش کاربران عادی (Users Auth)
# ==========================================

@router.post(
    "/users/register",
    response_model=UserAuthResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ثبت‌نام کاربر جدید",
    description="""
    ## ثبت‌نام کاربر عادی در سیستم
    اطلاعات کاربر جدید را ثبت کرده و توکن JWT به همراه شیء `user` بازمی‌گرداند.
    """
)
async def register_user(data: UserRegisterSchema, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.phone == data.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="کاربری با این شماره همراه قبلاً ثبت‌نام کرده است."
        )

    pwd_hash = hash_password(data.password) if data.password else None

    user = User(
        phone=data.phone,
        name=data.name,
        email=str(data.email) if data.email else None,
        password_hash=pwd_hash,
        role=UserRole.USER
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    role_str = str(user.role.value if hasattr(user.role, 'value') else user.role)
    token = create_access_token(data={"sub": str(user.id), "phone": user.phone, "role": role_str})

    return {
        "token": token,
        "user": UserDataSchema(
            id=str(user.id),
            phone=user.phone,
            name=user.name,
            email=user.email,
            role=role_str
        )
    }


@router.post(
    "/users/login",
    response_model=UserAuthResponseSchema,
    summary="ورود کاربر عادی",
    description="""
    ## ورود کاربران عادی به سیستم
    اعتبارسنجی شماره همراه و رمز عبور و بازگرداندن توکن و اطلاعات کاربر.
    """
)
async def login_user(data: UserLoginSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="شماره همراه یا رمز عبور اشتباه است."
        )

    if data.password and user.password_hash:
        if not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="شماره همراه یا رمز عبور اشتباه است."
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="حساب کاربری شما غیرفعال شده است."
        )

    role_str = str(user.role.value if hasattr(user.role, 'value') else user.role)
    token = create_access_token(data={"sub": str(user.id), "phone": user.phone, "role": role_str})

    return {
        "token": token,
        "user": UserDataSchema(
            id=str(user.id),
            phone=user.phone,
            name=user.name,
            email=user.email,
            role=role_str
        )
    }


# ==========================================
# ۳. بخش کارمندان (Employees Auth)
# ==========================================

@router.post(
    "/employees/login",
    response_model=EmployeeAuthResponseSchema,
    summary="ورود کارمندان سیستم",
    description="""
    ## ورود کارمندان به پنل اختصاصی
    احراز هویت کارمندان با شماره همراه و رمز عبور و صدور توکن دسترسی.
    """
)
async def login_employee(data: EmployeeLoginSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.phone == data.phone))
    employee = result.scalar_one_or_none()

    if not employee or not verify_password(data.password, employee.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="شماره همراه یا رمز عبور کارمند اشتباه است."
        )

    if not employee.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="حساب کاربری کارمند غیرفعال شده است."
        )

    token = create_access_token(data={"sub": str(employee.id), "phone": employee.phone, "role": "EMPLOYEE"})

    return {
        "token": token,
        "message": "ورود کارمند با موفقیت انجام شد"
    }