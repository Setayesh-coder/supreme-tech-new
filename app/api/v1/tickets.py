# app/api/v1/tickets.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.ticket import Ticket, TicketMessage, TicketStatus
from app.schemas.tickets import (
    TicketCreateSchema, GroupTicketCreateSchema, TicketMessageCreateSchema,
    TicketStatusUpdateSchema, TicketResponseSchema, TicketDetailResponseSchema
)

router = APIRouter(prefix="/tickets", tags=["تیکت‌ها و پشتیبانی (Tickets)"])


# تابع کمکی برای اعتبارسنجی دسترسی ادمین/مدیر
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای انجام این عملیات را ندارید."
        )
    return current_user


# ------------------------------------------------------------------
# ۱. دریافت لیست تمام تیکت‌ها (ویژه ادمین)
# ------------------------------------------------------------------
@router.get(
    "",
    response_model=List[TicketResponseSchema],
    summary="دریافت لیست تمام تیکت‌ها جهت پنل مدیریت",
    description="مشاهده تمامی تیکت‌های ثبت شده در سیستم (ویژه ادمین و پرسنل پشتیبانی)."
)
async def get_all_tickets(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Ticket).order_by(Ticket.created_at.desc()))
    return result.scalars().all()


# ------------------------------------------------------------------
# ۲. دریافت لیست تیکت‌های کاربر متصل (کاربر عادی / لاگین‌شده)
# ------------------------------------------------------------------
@router.get(
    "/my",
    response_model=List[TicketResponseSchema],
    summary="دریافت لیست تیکت‌های ایجادشده توسط کاربر متصل",
    description="دریافت کلیه تیکت‌های فردی یا گروهی که کاربر جاری در آن عضویت دارد."
)
async def get_my_tickets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Ticket)
        .outerjoin(Ticket.members)
        .where((Ticket.creator_id == current_user.id) | (User.id == current_user.id))
        .distinct()
        .order_by(Ticket.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


# ------------------------------------------------------------------
# ۳. دریافت جزئیات تیکت (سازنده، عضو گروه یا ادمین)
# ------------------------------------------------------------------
@router.get(
    "/{id}",
    response_model=TicketDetailResponseSchema,
    summary="دریافت جزئیات و تاریخچه پیام‌های یک تیکت مشخص",
    description="مشاهده اطلاعات کامل تیکت به همراه لیست تمام پیام‌ها و پاسخ‌های ارسال شده."
)
async def get_ticket_by_id(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Ticket)
        .options(selectinload(Ticket.messages), selectinload(Ticket.members))
        .where(Ticket.id == id)
    )
    result = await db.execute(query)
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="تیکت مورد نظر یافت نشد.")

    is_admin = current_user.role in [UserRole.ADMIN, UserRole.MANAGER]
    is_member = any(m.id == current_user.id for m in ticket.members)

    if ticket.creator_id != current_user.id and not is_member and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="شما دسترسی به این تیکت ندارید.")

    return TicketDetailResponseSchema(
        id=ticket.id,
        title=ticket.title,
        department=ticket.department,
        priority=ticket.priority,
        status=ticket.status,
        creator_id=ticket.creator_id,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        messages=ticket.messages,
        members=[m.id for m in ticket.members]
    )


# ------------------------------------------------------------------
# ۴. ایجاد تیکت پشتیبانی جدید (کاربر لاگین‌شده)
# ------------------------------------------------------------------
@router.post(
    "",
    response_model=TicketResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ایجاد تیکت پشتیبانی جدید",
    description="ثبت تیکت فردی جدید توسط کاربر متصل."
)
async def create_ticket(
    data: TicketCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_ticket = Ticket(
        title=data.title,
        department=data.department,
        priority=data.priority,
        creator_id=current_user.id,
        status=TicketStatus.OPEN
    )
    db.add(new_ticket)
    await db.flush()

    first_message = TicketMessage(
        ticket_id=new_ticket.id,
        sender_id=current_user.id,
        message=data.message
    )
    db.add(first_message)

    await db.commit()
    await db.refresh(new_ticket)
    return new_ticket


# ------------------------------------------------------------------
# ۵. ایجاد تیکت گروهی (کاربر لاگین‌شده یا ادمین)
# ------------------------------------------------------------------
@router.post(
    "/group",
    response_model=TicketResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ایجاد تیکت پشتیبانی گروهی",
    description="ایجاد تیکت با امکان افزودن چند کاربر (عضو) به صورت همزمان."
)
async def create_group_ticket(
    data: GroupTicketCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_ticket = Ticket(
        title=data.title,
        department=data.department,
        priority=data.priority,
        creator_id=current_user.id,
        status=TicketStatus.OPEN
    )

    if data.members:
        users_res = await db.execute(select(User).where(User.id.in_(data.members)))
        members = users_res.scalars().all()
        new_ticket.members.extend(members)

    db.add(new_ticket)
    await db.flush()

    first_message = TicketMessage(
        ticket_id=new_ticket.id,
        sender_id=current_user.id,
        message=data.message
    )
    db.add(first_message)

    await db.commit()
    await db.refresh(new_ticket)
    return new_ticket


# ------------------------------------------------------------------
# ۶. ارسال پاسخ جدید روی تیکت (ذینفعان تیکت یا ادمین)
# ------------------------------------------------------------------
@router.post(
    "/{id}/message",
    status_code=status.HTTP_201_CREATED,
    summary="ارسال پاسخ یا پیام جدید روی تیکت",
    description="ثبت پاسخ جدید روی تیکت توسط کاربر یا کارشناس."
)
async def add_ticket_message(
    id: str,
    data: TicketMessageCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Ticket).options(selectinload(Ticket.members)).where(Ticket.id == id)
    result = await db.execute(query)
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="تیکت مورد نظر یافت نشد.")

    is_admin = current_user.role in [UserRole.ADMIN, UserRole.MANAGER]
    is_member = any(m.id == current_user.id for m in ticket.members)

    if ticket.creator_id != current_user.id and not is_member and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="شما دسترسی به این تیکت ندارید.")

    new_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=data.message,
        attachments=data.attachments
    )
    db.add(new_msg)

    # بروزرسانی وضعیت تیکت
    if is_admin:
        ticket.status = TicketStatus.ANSWERED
    else:
        ticket.status = TicketStatus.PENDING

    await db.commit()
    return {"message": "پیام با موفقیت ثبت شد."}


# ------------------------------------------------------------------
# ۷. تغییر وضعیت تیکت (ویژه ادمین)
# ------------------------------------------------------------------
@router.patch(
    "/{id}/status",
    summary="تغییر وضعیت تیکت",
    description="تغییر وضعیت تیکت (مثلا بستن تیکت یا در حال بررسی - ویژه ادمین)."
)
async def update_ticket_status(
    id: str,
    data: TicketStatusUpdateSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Ticket).where(Ticket.id == id))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="تیکت مورد نظر یافت نشد.")

    ticket.status = data.status
    await db.commit()

    return {"message": f"وضعیت تیکت به '{data.status}' تغییر یافت."}


# ------------------------------------------------------------------
# ۸. حذف تیکت (ویژه ادمین)
# ------------------------------------------------------------------
@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف تیکت",
    description="حذف کامل تیکت و تمامی پیام‌های آن (نیازمند دسترسی ادمین)."
)
async def delete_ticket(
    id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Ticket).where(Ticket.id == id))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="تیکت مورد نظر یافت نشد.")

    await db.delete(ticket)
    await db.commit()

    return {"message": "تیکت با موفقیت حذف شد."}