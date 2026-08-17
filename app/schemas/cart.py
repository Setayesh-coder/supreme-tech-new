#app/schemas/cart.py
from pydantic import BaseModel, Field
from typing import List, Optional

class CartItemSchema(BaseModel):
    enrollment_id: str = Field(..., description="آیدی یونیک ثبت‌نام اولیه (PENDING)")
    course_id: str = Field(..., description="آیدی دوره")
    course_title: str = Field(..., description="عنوان دوره برای نمایش در سبد")
    original_price: int = Field(..., description="قیمت اصلی دوره به تومان")
    discounted_price: int = Field(..., description="قیمت پس از تخفیف پایه خود دوره")
    applied_coupon_discount: int = Field(..., description="سهم این دوره از مبلغ کد تخفیف اعمال شده")
    final_price: int = Field(..., description="مبلغ نهایی این آیتم پس از تمام تخفیف‌ها")

class CartSummarySchema(BaseModel):
    total_original_price: int = Field(..., description="مجموع قیمت اصلی دوره‌ها")
    total_courses_discount: int = Field(..., description="مجموع تخفیف‌های مستقیم روی دوره‌ها")
    coupon_code: Optional[str] = Field(None, description="کد تخفیف اعمال شده در صورت وجود")
    coupon_discount: int = Field(..., description="مبلغ کسر شده توسط کد تخفیف")
    total_payable: int = Field(..., description="مبلغ نهایی قابل پرداخت (به تومان)")

class CartResponseSchema(BaseModel):
    """ساختار خروجی اندپوینت GET /api/v1/cart"""
    items: List[CartItemSchema]
    summary: CartSummarySchema