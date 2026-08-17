#app/schemas/payment
from pydantic import BaseModel, Field
from typing import Optional

class CardToCardSubmitRequest(BaseModel):
    """اسکیمای ثبت اطلاعات کارت به کارت توسط کاربر"""
    tracking_code: Optional[str] = Field(None, description="کد پیگیری بانکی (در صورت وجود)")
    receipt_image_url: Optional[str] = Field(None, description="لینک تصویر آپلود شده از رسید")
    
class BleBotInitiateResponse(BaseModel):
    """خروجی اندپوینت ساخت لینک پرداخت بله"""
    payment_link: str = Field(..., description="لینک دیپ‌لینک بله برای هدایت کاربر به ربات")
    token: str = Field(..., description="توکن یکبار مصرف (فقط برای دیباگ یا لاگ)")

class BleBotCallbackRequest(BaseModel):
    """اسکیمای درخواستی که کد ربات بله به بک‌اند می‌فرستد (Webhook/Callback داخلی)"""
    token: str = Field(..., description="توکن پرداختی که ربات در استارت دریافت کرده")
    status: str = Field(..., description="وضعیت تراکنش: SUCCESS یا FAILED")
    trans_id: Optional[str] = Field(None, description="شماره تراکنش درگاه بله")