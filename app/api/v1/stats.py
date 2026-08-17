from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date, desc
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.stat import PageView
from app.models.event import Event
from app.models.message import Message
from app.schemas.stats import (
    RecordViewSchema, StatsOverviewSchema,
    DailyStatItemSchema, PageStatItemSchema
)

router = APIRouter(prefix="/stats", tags=["آمار و آنالیتیکس (Stats)"])


# تابع کمکی بررسی دسترسی ادمین
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


# ------------------------------------------------------------------
# ۱. دریافت آمار کلی سامانه (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.get(
    "/overview",
    response_model=StatsOverviewSchema,
    summary="دریافت آمار کلی سامانه",
    description="خلاصه آمار سیستم شامل کل بازدیدها، بازدیدکنندگان یکتا، رویدادها و وضعیت پیام‌ها."
)
async def get_stats_overview(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    # کل بازدیدها
    total_views_res = await db.execute(select(func.count(PageView.id)))
    total_views = total_views_res.scalar_one_or_none() or 0

    # کاربران یکتا (بر اساس IP)
    unique_visitors_res = await db.execute(
        select(func.count(func.distinct(PageView.ip_address)))
    )
    unique_visitors = unique_visitors_res.scalar_one_or_none() or 0

    # کل رویدادها
    total_events_res = await db.execute(select(func.count(Event.id)))
    total_events = total_events_res.scalar_one_or_none() or 0

    # کل پیام‌ها و پیام‌های خوانده‌نشده
    total_msgs_res = await db.execute(select(func.count(Message.id)))
    total_messages = total_msgs_res.scalar_one_or_none() or 0

    unread_msgs_res = await db.execute(
        select(func.count(Message.id)).where(Message.is_read == False)
    )
    unread_messages = unread_msgs_res.scalar_one_or_none() or 0

    return StatsOverviewSchema(
        total_views=total_views,
        unique_visitors=unique_visitors,
        total_events=total_events,
        total_messages=total_messages,
        unread_messages=unread_messages
    )


# ------------------------------------------------------------------
# ۲. دریافت آمار تفکیکی و نموداری روزانه (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.get(
    "/daily",
    response_model=List[DailyStatItemSchema],
    summary="دریافت آمار تفکیکی و نموداری روزانه",
    description="آمار روزانه بازدیدها جهت رسم نمودار در داشبورد مدیریتی."
)
async def get_daily_stats(
    days: int = Query(7, ge=1, le=90, description="تعداد روزهای گذشته جهت دریافت آمار"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    start_date = datetime.utcnow() - timedelta(days=days)

    query = (
        select(
            cast(PageView.viewed_at, Date).label("date"),
            func.count(PageView.id).label("views"),
            func.count(func.distinct(PageView.ip_address)).label("unique_visitors")
        )
        .where(PageView.viewed_at >= start_date)
        .group_by(cast(PageView.viewed_at, Date))
        .order_by(cast(PageView.viewed_at, Date).asc())
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        DailyStatItemSchema(
            date=str(row.date),
            views=row.views,
            unique_visitors=row.unique_visitors
        )
        for row in rows
    ]


# ------------------------------------------------------------------
# ۳. دریافت آمار میزان بازدید از صفحات مختلف سایت (نیازمند دسترسی ادمین)
# ------------------------------------------------------------------
@router.get(
    "/pages",
    response_model=List[PageStatItemSchema],
    summary="دریافت آمار میزان بازدید از صفحات مختلف سایت",
    description="لیست پربازدیدترین صفحات سایت به همراه درصد اختصاص داده شده."
)
async def get_page_stats(
    limit: int = Query(10, ge=1, le=50, description="تعداد صفحات اصلی"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    total_views_res = await db.execute(select(func.count(PageView.id)))
    total_views = total_views_res.scalar_one_or_none() or 1

    query = (
        select(
            PageView.path,
            func.count(PageView.id).label("views")
        )
        .group_by(PageView.path)
        .order_by(desc("views"))
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        PageStatItemSchema(
            path=row.path,
            views=row.views,
            percentage=round((row.views / total_views) * 100, 2)
        )
        for row in rows
    ]


# ------------------------------------------------------------------
# ۴. ثبت بازدید جدید توسط کاربران (عمومی - بدون نیاز به توکن)
# ------------------------------------------------------------------
@router.post(
    "/view",
    status_code=status.HTTP_201_CREATED,
    summary="ثبت بازدید جدید توسط کاربران (عمومی)",
    description="ثبت ترافیک و آمار بازدید صفحات از فرانت‌اند."
)
async def record_page_view(
    data: RecordViewSchema,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # دریافت آی‌پی
    client_ip = data.ip
    if not client_ip:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        elif request.client:
            client_ip = request.client.host

    user_agent = data.userAgent or request.headers.get("user-agent")

    new_view = PageView(
        path=data.path,
        referrer=data.referrer,
        user_agent=user_agent,
        ip_address=client_ip,
        session_id=data.sessionId
    )

    db.add(new_view)
    await db.commit()

    return {"message": "بازدید با موفقیت ثبت شد."}