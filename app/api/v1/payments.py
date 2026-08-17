# app/api/v1/payments.py
import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.order import Order, OrderStatus, PaymentMethod
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.coupon import Coupon, CouponUsage
from app.schemas.payment import CardToCardSubmitRequest, BleBotInitiateResponse, BleBotCallbackRequest

router = APIRouter(prefix="/payments", tags=["پرداخت (Payments)"])

# کلید امنیتی مخفی برای ارتباط ربات بله و بک‌اند (از فایل env خوانده شود)
SECRET_BOT_API_KEY = os.getenv("BOT_API_KEY", "super_secret_bot_token_xyz123")

async def verify_bot_token(x_bot_api_key: str = Header(...)):
    """وابستگی برای چک کردن اینکه درخواست حتما از طرف کد ربات بله آمده است"""
    if x_bot_api_key != SECRET_BOT_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized Bot Access")

# -------------------------------------------------------------------
# بخش اول: کارت به کارت
# -------------------------------------------------------------------

@router.post("/card-to-card", summary="ثبت رسید پرداخت کارت به کارت")
async def submit_card_payment(
    data: CardToCardSubmitRequest, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # پیدا کردن فاکتور معلق کاربر
    stmt = select(Order).where(Order.user_id == current_user.id, Order.status == OrderStatus.PENDING)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order or order.final_amount == 0:
        raise HTTPException(status_code=400, detail="فاکتور معتبری برای پرداخت یافت نشد.")

    # تغییر وضعیت فاکتور به در انتظار تایید ادمین
    order.payment_method = PaymentMethod.CARD_TO_CARD
    order.status = OrderStatus.WAITING_FOR_APPROVAL
    order.tracking_code = data.tracking_code
    order.receipt_image_url = data.receipt_image_url
    
    await db.commit()
    return {"message": "رسید شما با موفقیت ثبت شد و پس از بررسی ادمین، دوره‌ها فعال خواهند شد."}

# -------------------------------------------------------------------
# بخش دوم: پرداخت اتوماتیک از طریق ربات بله
# -------------------------------------------------------------------

@router.post("/ble/initiate", response_model=BleBotInitiateResponse, summary="تولید لینک پرداخت ربات بله")
async def initiate_ble_payment(
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    stmt = select(Order).where(Order.user_id == current_user.id, Order.status == OrderStatus.PENDING)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=400, detail="سبد خرید خالی است یا فاکتور معتبری وجود ندارد.")
        
    # تولید یک توکن یکبار مصرف سخت و غیرقابل حدس
    payment_token = f"pay_{uuid.uuid4().hex}"
    
    order.payment_method = PaymentMethod.BLE_BOT
    order.ble_payment_token = payment_token
    await db.commit()

    bot_username = os.getenv("BLE_BOT_USERNAME", "YourBotID")
    deep_link = f"https://ble.ir/{bot_username}?start={payment_token}"
    
    return {"payment_link": deep_link, "token": payment_token}

@router.get("/ble/checkout-info", summary="استعلام اطلاعات فاکتور توسط ربات")
async def get_checkout_info_for_bot(
    token: str, 
    db: AsyncSession = Depends(get_db), 
    _ = Depends(verify_bot_token)
):
    """ربات بله این اندپوینت را صدا میزند تا بداند به کاربر چه پیامی نشان دهد"""
    stmt = select(Order).where(Order.ble_payment_token == token, Order.status == OrderStatus.PENDING)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="توکن پرداخت نامعتبر یا منقضی شده است.")
        
    return {
        "order_id": str(order.id),
        "total_amount": order.final_amount,
        "user_id": str(order.user_id)
    }
    
@router.post("/ble/callback", summary="اعلام نتیجه پرداخت توسط ربات به بک‌اند")
async def ble_payment_callback(
    data: BleBotCallbackRequest, 
    db: AsyncSession = Depends(get_db), 
    _ = Depends(verify_bot_token)
):
    """ربات بله پس از پرداخت موفق/ناموفق کاربر، نتیجه را به اینجا پست می‌کند"""
    stmt = select(Order).where(Order.ble_payment_token == data.token)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="فاکتور یافت نشد.")

    if data.status == "SUCCESS":
        # 1. تغییر وضعیت فاکتور
        order.status = OrderStatus.PAID
        
        # 2. تغییر وضعیت ثبت‌نام‌های کاربر (Enrollments) از PENDING به CONFIRMED
        enr_stmt = select(Enrollment).where(
            Enrollment.user_id == order.user_id,
            Enrollment.status == EnrollmentStatus.PENDING
        )
        enr_res = await db.execute(enr_stmt)
        enrollments = enr_res.scalars().all()
        
        for enr in enrollments:
            enr.status = EnrollmentStatus.CONFIRMED

        # 3. ثبت استفاده از کد تخفیف (اگر کدی روی این فاکتور اعمال شده بود)
        if order.coupon_id:
            coupon_stmt = select(Coupon).where(Coupon.id == order.coupon_id)
            coupon_res = await db.execute(coupon_stmt)
            coupon = coupon_res.scalar_one_or_none()

            if coupon:
                coupon.used_count += 1
                usage_record = CouponUsage(coupon_id=coupon.id, user_id=order.user_id, order_id=order.id)
                db.add(usage_record)
        
        await db.commit()
        return {"message": "پرداخت با موفقیت ثبت شد و دوره‌ها فعال شدند."}
        
    else:
        order.status = OrderStatus.FAILED
        await db.commit()
        return {"message": "پرداخت ناموفق ثبت شد."}