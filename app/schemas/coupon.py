#app/schemas/coupon
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.coupon import DiscountType

class CouponCreateRequest(BaseModel):
    """اسکیمای درخواست ساخت کد تخفیف جدید توسط ادمین"""
    code: str = Field(..., description="کد تخفیف (مثلا YALDA1403)", min_length=3, max_length=50)
    discount_type: DiscountType = Field(default=DiscountType.PERCENTAGE, description="نوع تخفیف (درصدی یا مبلغ ثابت)")
    discount_value: int = Field(..., description="مقدار تخفیف (مثلا 20 برای درصد یا 50000 برای مبلغ ثابت)", gt=0)
    max_discount_amount: Optional[int] = Field(None, description="سقف تخفیف برای حالت درصدی (به تومان)")
    min_order_amount: Optional[int] = Field(None, description="حداقل مبلغ سبد خرید برای اعمال کد (به تومان)")
    expires_at: Optional[datetime] = Field(None, description="تاریخ انقضا (ایزو فرمت). خالی بودن یعنی نامحدود")
    max_uses: Optional[int] = Field(None, description="تعداد کل دفعات مجاز استفاده")
    max_uses_per_user: int = Field(1, description="سقف استفاده برای هر کاربر یکتا")
    allowed_courses: Optional[List[str]] = Field(None, description="لیست آیدی دوره‌های مجاز. خالی = همه دوره‌ها")
    allowed_phones: Optional[List[str]] = Field(None, description="لیست شماره موبایل‌های مجاز. خالی = همه کاربران")

class CouponApplyRequest(BaseModel):
    """اسکیمای درخواست اعمال کد تخفیف در سبد خرید توسط کاربر"""
    code: str = Field(..., description="کد تخفیفی که کاربر در باکس وارد کرده است")

class CouponResponse(CouponCreateRequest):
    """اسکیمای خروجی برای نمایش اطلاعات کد تخفیف به ادمین"""
    id: str = Field(..., description="آیدی یکتای کد تخفیف در دیتابیس")
    used_count: int = Field(..., description="تعداد دفعاتی که تا الان استفاده شده")
    is_active: bool = Field(..., description="وضعیت فعال بودن کد")
    
    class Config:
        orm_mode = True