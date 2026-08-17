#app/models/order.py
from typing import Optional, List, Any
from enum import Enum
from sqlalchemy import String, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

class PaymentMethod(str, Enum):
    """روش‌های پرداخت پشتیبانی شده در سیستم"""
    CARD_TO_CARD = "card_to_card"  # کارت به کارت دستی
    BLE_BOT = "ble_bot"            # پرداخت از طریق ربات بله

class OrderStatus(str, Enum):
    """وضعیت‌های مختلف یک فاکتور/سفارش"""
    PENDING = "pending"                       # ایجاد شده اما هنوز اقدامی برای پرداخت نشده
    WAITING_FOR_APPROVAL = "waiting_for_approval" # کاربر رسید آپلود کرده و منتظر تایید ادمین است
    PAID = "paid"                             # پرداخت با موفقیت انجام و تایید شد
    FAILED = "failed"                         # پرداخت ناموفق بود (مثلا در ربات بله)
    REJECTED = "rejected"                     # ادمین رسید کارت به کارت را رد کرد

class Order(BaseModel):
    """
    مدل فاکتور/سفارش
    این مدل نماینده یک تراکنش مالی است که سبد خرید را به یک پرداخت واقعی متصل می‌کند.
    """
    __tablename__ = "orders"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    coupon_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("coupons.id", ondelete="SET NULL"), nullable=True)
    
    # اطلاعات مالی محاسبه شده (به تومان)
    total_original_price: Mapped[int] = mapped_column(Integer, nullable=False, doc="مجموع قیمت اصلی دوره‌ها بدون هیچ تخفیفی")
    total_discount: Mapped[int] = mapped_column(Integer, default=0, doc="مجموع کل تخفیف‌ها (تخفیف خود دوره + کد تخفیف)")
    final_amount: Mapped[int] = mapped_column(Integer, nullable=False, doc="مبلغ نهایی که کاربر باید پرداخت کند (یا پرداخت کرده)")
    
    # متادیتا و لاگ دوره‌های موجود در سبد در زمان خرید
    # این فیلد حیاتی است چون اگر قیمت دوره‌ای در آینده تغییر کرد، فاکتورهای قدیمی خراب نمی‌شوند
    courses_snapshot: Mapped[List[Any]] = mapped_column(JSON, nullable=False, doc="اسنپ‌شاتی از اطلاعات دوره‌ها (ID، نام، قیمت) در لحظه ثبت فاکتور")
    
    # اطلاعات پرداخت
    payment_method: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, doc="روش پرداخت انتخاب شده")
    status: Mapped[str] = mapped_column(String(20), default=OrderStatus.PENDING, doc="وضعیت فعلی پرداخت")
    
    # فیلدهای مخصوص کارت به کارت
    receipt_image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True, doc="آدرس تصویر رسید واریزی")
    tracking_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, doc="کد پیگیری تراکنش بانکی دستی")
    
    # فیلدهای مخصوص ربات بله
    ble_payment_token: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True, nullable=True, doc="توکن یکبار مصرف برای احراز هویت در ربات بله")

    # روابط
    coupon: Mapped[Optional["Coupon"]] = relationship("Coupon", back_populates="orders")
    # فرض بر این است که مدل User رابطه متقابل را دارد
    # user: Mapped["User"] = relationship("User", back_populates="orders")