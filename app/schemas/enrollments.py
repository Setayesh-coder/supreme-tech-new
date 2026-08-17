# app/schemas/enrollments.py
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from app.models.enrollment import EnrollmentStatus

# اسکیمای دریافت داده‌های پاپ‌آپ
class CoursePreRegisterSchema(BaseModel):
    course_id: str = Field(..., description="شناسه دوره", example="c1234567-89ab-cdef-0123-456789abcdef")
    field_of_study: str = Field(..., description="رشته تحصیلی", example="مهندسی هوافضا")
    university: str = Field(..., description="دانشگاه", example="دانشگاه شریف")
    has_experience: bool = Field(False, description="آیا تجربه قبلی در این زمینه دارید؟")
    experience_level: Optional[str] = Field(None, description="سطح تجربه (مبتدی، متوسط، پیشرفته)", example="مبتدی")
    has_laptop: bool = Field(True, description="آیا سیستم/لپ‌تاپ شخصی دارید؟")
    os_type: Optional[str] = Field(None, description="سیستم عامل", example="Windows")
    goal: Optional[str] = Field(None, description="هدف از شرکت در دوره", example="ارتقای مهارت شغلی")
    referral_source: Optional[str] = Field(None, description="نحوه آشنایی", example="اینستاگرام")

class EnrollmentStatusUpdateSchema(BaseModel):
    status: EnrollmentStatus = Field(..., description="وضعیت جدید ثبت‌نام")

class MeetingLinkSchema(BaseModel):
    meeting_link: HttpUrl = Field(..., description="لینک جلسه آنلاین", example="https://meet.jit.si/my-custom-room")

class EnrollmentResponseSchema(BaseModel):
    id: str
    user_id: str
    course_id: Optional[str] = None
    event_id: Optional[str] = None
    status: EnrollmentStatus
    meeting_link: Optional[str] = None
    
    # اطلاعات نظرسنجی
    field_of_study: Optional[str] = None
    university: Optional[str] = None
    has_experience: bool = False
    experience_level: Optional[str] = None
    has_laptop: bool = False
    os_type: Optional[str] = None
    goal: Optional[str] = None
    referral_source: Optional[str] = None
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True