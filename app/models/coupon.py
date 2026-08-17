# app/models/coupon.py
from typing import Optional, List, Any
from enum import Enum
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class DiscountType(str, Enum):
    """انواع تخفیف‌های قابل اعمال روی سیستم"""
    PERCENTAGE = "percentage"      # تخفیف درصدی (مثلا ۲۰ درصد)
    FIXED_AMOUNT = "fixed_amount"  # تخفیف مبلغ ثابت (مثلا ۵۰ هزار تومان)


class Coupon(BaseModel):
    """
    مدل کدهای تخفیف
    این مدل شامل تمام قوانین، سقف‌ها و محدودیت‌های یک کد تخفیف است.
    """
    __tablename__ = "coupons"

    # اطلاعات پایه
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False, doc="کد یکتای تخفیف مثلا SUMMER1403")
    discount_type: Mapped[str] = mapped_column(String(20), default=DiscountType.PERCENTAGE, doc="نوع تخفیف: درصدی یا ثابت")
    discount_value: Mapped[int] = mapped_column(Integer, nullable=False, doc="مقدار تخفیف (درصد یا مبلغ به تومان)")
    
    # محدودیت‌های مالی
    max_discount_amount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, doc="سقف مبلغ تخفیف برای حالت درصدی")
    min_order_amount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, doc="حداقل مبلغ سبد خرید برای امکان استفاده از کد")
    
    # محدودیت‌های زمانی و تعدادی
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, doc="تاریخ و زمان انقضا. نال بودن = نامحدود")
    max_uses: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, doc="سقف تعداد استفاده کل. نال بودن = نامحدود")
    used_count: Mapped[int] = mapped_column(Integer, default=0, doc="تعداد دفعاتی که تا کنون از این کد استفاده شده است")
    max_uses_per_user: Mapped[int] = mapped_column(Integer, default=1, doc="سقف تعداد استفاده برای هر کاربر یکتا")
    
    # محدودیت‌های هدف (تارگتینگ)
    allowed_courses: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True, doc="لیست آیدی دوره‌های مجاز. نال بودن = معتبر برای همه")
    allowed_phones: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True, doc="لیست شماره تلفن‌های مجاز. نال بودن = معتبر برای همه")
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, doc="وضعیت فعال یا غیرفعال بودن کد تخفیف")

    # روابط
    usages: Mapped[List["CouponUsage"]] = relationship("CouponUsage", back_populates="coupon", cascade="all, delete-orphan")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="coupon")


class CouponUsage(BaseModel):
    """
    تاریخچه استفاده از کدهای تخفیف
    برای کنترل اینکه یک کاربر چند بار از یک کد خاص استفاده کرده است (max_uses_per_user)
    """
    __tablename__ = "coupon_usages"

    coupon_id: Mapped[str] = mapped_column(String(36), ForeignKey("coupons.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # آیدی سفارش مرتبط
    order_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)

    # روابط
    coupon: Mapped["Coupon"] = relationship("Coupon", back_populates="usages")