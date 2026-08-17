# app/models/enrollment.py
from typing import Optional
from enum import Enum
from sqlalchemy import String, Integer, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

class EnrollmentStatus(str, Enum):
    PENDING = "PENDING"      # در انتظار پرداخت / در سبد خرید
    CONFIRMED = "CONFIRMED"  # ثبت‌نام قطعی (پرداخت شده)
    CANCELLED = "CANCELLED"  # لغو شده
    WAITING = "WAITING"      # لیست انتظار
    ATTENDED = "ATTENDED"    # شرکت کرده

class Enrollment(BaseModel):
    __tablename__ = "enrollments"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    event_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    
    status: Mapped[EnrollmentStatus] = mapped_column(
        SQLEnum(
            EnrollmentStatus,
            name="enrollmentstatus",
            values_callable=lambda x: [e.value for e in x],
            native_enum=True
        ),
        default=EnrollmentStatus.PENDING,
        nullable=False
    )
    meeting_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # --- فیلدهای پاپ‌آپ سنجش ورودی (Survey Fields) ---
    field_of_study: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # رشته تحصیلی
    university: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)      # دانشگاه
    has_experience: Mapped[bool] = mapped_column(Boolean, default=False)                # تجربه قبلی
    experience_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # سطح تجربه (مبتدی/متوسط/پیشرفته)
    has_laptop: Mapped[bool] = mapped_column(Boolean, default=False)                   # داشتن لپ‌تاپ
    os_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)          # سیستم‌عامل (Windows/macOS/Linux)
    goal: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)             # هدف از شرکت
    referral_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # نحوه آشنایی

    # روابط
    user: Mapped["User"] = relationship("User", back_populates="enrollments")
    course: Mapped[Optional["Course"]] = relationship("Course", back_populates="enrollments")
    event: Mapped[Optional["Event"]] = relationship("Event", back_populates="enrollments")