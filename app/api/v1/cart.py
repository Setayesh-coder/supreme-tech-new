# app/api/v1/cart.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user 
from app.models.user import User
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.course import Course
from app.models.coupon import Coupon, DiscountType, CouponUsage
from app.models.order import Order, OrderStatus
from app.schemas.cart import CartResponseSchema, CartItemSchema, CartSummarySchema
from app.schemas.coupon import CouponApplyRequest

router = APIRouter(prefix="/cart", tags=["سبد خرید و اعمال کد تخفیف (Cart & Checkout)"])


async def get_or_create_pending_order(db: AsyncSession, user_id: str) -> Order:
    """تابع کمکی async: پیدا کردن فاکتور معلق کاربر یا ساخت یک فاکتور جدید"""
    stmt = select(Order).where(Order.user_id == user_id, Order.status == OrderStatus.PENDING)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        order = Order(
            user_id=user_id,
            total_original_price=0,
            final_amount=0,
            courses_snapshot=[]
        )
        db.add(order)
        await db.commit()
        await db.refresh(order)
    return order


@router.get("/", response_model=CartResponseSchema, summary="مشاهده سبد خرید", description="لیست دوره‌های در انتظار پرداخت کاربر را همراه با محاسبات قیمت و تخفیف‌ها برمی‌گرداند.")
async def get_cart(
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. گرفتن دوره‌های PENDING کاربر
    stmt = select(Enrollment).where(
        Enrollment.user_id == current_user.id,
        Enrollment.status == EnrollmentStatus.PENDING
    )
    result = await db.execute(stmt)
    pending_enrollments = result.scalars().all()

    if not pending_enrollments:
        return {
            "items": [], 
            "summary": {
                "total_original_price": 0, 
                "total_courses_discount": 0, 
                "coupon_code": None, 
                "coupon_discount": 0, 
                "total_payable": 0
            }
        }

    # 2. گرفتن فاکتور معلق برای بررسی کد تخفیف اعمال شده
    pending_order = await get_or_create_pending_order(db, str(current_user.id))
    
    applied_coupon = None
    if pending_order.coupon_id:
        coupon_stmt = select(Coupon).where(Coupon.id == pending_order.coupon_id)
        coupon_res = await db.execute(coupon_stmt)
        applied_coupon = coupon_res.scalar_one_or_none()

    items_response = []
    total_original = 0
    total_courses_discount = 0  # اگر در آینده خود دوره تخفیف داشت اینجا محاسبه می‌شود
    total_coupon_discount = 0

    # 3. محاسبه قیمت‌ها روی هر آیتم
    for enr in pending_enrollments:
        course_stmt = select(Course).where(Course.id == enr.course_id)
        c_res = await db.execute(course_stmt)
        course = c_res.scalar_one()

        base_price = course.price
        total_original += base_price
        
        # محاسبه سهم تخفیف کد روی این دوره (اگر اعمال شده باشد و مجاز باشد)
        item_coupon_discount = 0
        if applied_coupon:
            is_course_allowed = True
            if applied_coupon.allowed_courses and str(course.id) not in applied_coupon.allowed_courses:
                is_course_allowed = False
            
            if is_course_allowed:
                if applied_coupon.discount_type == DiscountType.PERCENTAGE:
                    item_coupon_discount = int(base_price * (applied_coupon.discount_value / 100))

        items_response.append({
            "enrollment_id": str(enr.id),
            "course_id": str(course.id),
            "course_title": course.title,
            "original_price": base_price,
            "discounted_price": base_price,
            "applied_coupon_discount": item_coupon_discount,
            "final_price": base_price - item_coupon_discount
        })
    # 4. محاسبه نهایی مجموع
    if applied_coupon and applied_coupon.discount_type == DiscountType.PERCENTAGE:
        total_coupon_discount = int(total_original * (applied_coupon.discount_value / 100))
        if applied_coupon.max_discount_amount and total_coupon_discount > applied_coupon.max_discount_amount:
            total_coupon_discount = applied_coupon.max_discount_amount
            
    elif applied_coupon and applied_coupon.discount_type == DiscountType.FIXED_AMOUNT:
        total_coupon_discount = applied_coupon.discount_value

    # جلوگیری از منفی شدن مبلغ قابل پرداخت
    total_payable = max(0, total_original - total_coupon_discount)

    # 5. بروزرسانی فاکتور موقت با مبالغ جدید
    pending_order.total_original_price = total_original
    pending_order.total_discount = total_coupon_discount
    pending_order.final_amount = total_payable
    await db.commit()

    return {
        "items": items_response,
        "summary": {
            "total_original_price": total_original,
            "total_courses_discount": total_courses_discount,
            "coupon_code": applied_coupon.code if applied_coupon else None,
            "coupon_discount": total_coupon_discount,
            "total_payable": total_payable
        }
    }


@router.post("/apply-coupon", summary="اعمال کد تخفیف", description="اعتبارسنجی کامل کد تخفیف و اعمال آن روی سبد خرید جاری کاربر.")
async def apply_coupon(
    request: CouponApplyRequest, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    stmt = select(Coupon).where(Coupon.code == request.code)
    res = await db.execute(stmt)
    coupon = res.scalar_one_or_none()
    
    # Validation 1: وجود کد و فعال بودن
    if not coupon or not coupon.is_active:
        raise HTTPException(status_code=400, detail="کد تخفیف نامعتبر است یا وجود ندارد.")
        
    # Validation 2: تاریخ انقضا
    if coupon.expires_at and coupon.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="تاریخ انقضای این کد تخفیف گذشته است.")
        
    # Validation 3: سقف استفاده کل
    if coupon.max_uses and coupon.used_count >= coupon.max_uses:
        raise HTTPException(status_code=400, detail="ظرفیت استفاده از این کد تخفیف به پایان رسیده است.")
        
    # Validation 4: محدودیت شماره تماس
    phone = getattr(current_user, "phone_number", None)
    if coupon.allowed_phones and phone not in coupon.allowed_phones:
        raise HTTPException(status_code=403, detail="این کد تخفیف برای حساب کاربری شما فعال نشده است.")

    # Validation 5: بررسی سقف استفاده کاربر جاری
    usage_stmt = select(func.count(CouponUsage.id)).where(
        CouponUsage.coupon_id == coupon.id,
        CouponUsage.user_id == current_user.id
    )
    usage_res = await db.execute(usage_stmt)
    user_usage_count = usage_res.scalar() or 0

    if coupon.max_uses_per_user and user_usage_count >= coupon.max_uses_per_user:
        raise HTTPException(status_code=400, detail="شما بیش از حد مجاز از این کد استفاده کرده‌اید.")

    pending_order = await get_or_create_pending_order(db, str(current_user.id))
    
    # Validation 6: حداقل مبلغ خرید
    if coupon.min_order_amount and pending_order.total_original_price < coupon.min_order_amount:
        raise HTTPException(status_code=400, detail=f"برای استفاده از این کد، حداقل مبلغ سبد خرید باید {coupon.min_order_amount} تومان باشد.")

    # اعمال موفقیت‌آمیز
    pending_order.coupon_id = coupon.id
    await db.commit()
    
    return {"message": "کد تخفیف با موفقیت اعمال شد."}


@router.delete("/remove-coupon", summary="حذف کد تخفیف", description="کد تخفیف اعمال شده را از سبد خرید حذف می‌کند.")
async def remove_coupon(
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    pending_order = await get_or_create_pending_order(db, str(current_user.id))
    pending_order.coupon_id = None
    await db.commit()
    return {"message": "کد تخفیف از سبد خرید شما حذف شد."}