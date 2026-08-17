# app/api/v1/team.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.team import TeamMember
from app.schemas.team import (
    TeamMemberCreateSchema, TeamMemberUpdateSchema, TeamMemberResponseSchema
)

router = APIRouter(prefix="/team", tags=["اعضای تیم (Team)"])


@router.get(
    "",
    response_model=List[TeamMemberResponseSchema],
    summary="دریافت لیست تمامی اعضای تیم (عمومی)",
    description="دریافت لیست اعضای فعال تیم به ترتیب اولویت نمایش (display_order)."
)
async def get_team_members(db: AsyncSession = Depends(get_db)):
    query = (
        select(TeamMember)
        .where(TeamMember.is_active == True)
        .order_by(TeamMember.display_order.asc(), TeamMember.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get(
    "/{id}",
    response_model=TeamMemberResponseSchema,
    summary="دریافت اطلاعات یک عضو مشخص از تیم",
    description="دریافت اطلاعات کامل یک عضو تیم بر اساس شناسه ID."
)
async def get_team_member_by_id(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TeamMember).where(TeamMember.id == id))
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="عضو مورد نظر در تیم یافت نشد."
        )

    return member


@router.post(
    "",
    response_model=TeamMemberResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="افزودن عضو جدید به تیم",
    description="افزودن یک همکار/عضو جدید به تیم (نیازمند دسترسی ادمین)."
)
async def create_team_member(
    data: TeamMemberCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_member = TeamMember(**data.model_dump())
    db.add(new_member)
    await db.commit()
    await db.refresh(new_member)

    return new_member


@router.put(
    "/{id}",
    response_model=TeamMemberResponseSchema,
    summary="به‌روزرسانی اطلاعات عضو تیم",
    description="ویرایش مشخصات یا سمت عضو تیم بر اساس شناسه (نیازمند دسترسی ادمین)."
)
async def update_team_member(
    id: str,
    data: TeamMemberUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TeamMember).where(TeamMember.id == id))
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="عضو مورد نظر در تیم یافت نشد."
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(member, key, value)

    await db.commit()
    await db.refresh(member)

    return member


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف عضو از تیم",
    description="حذف کامل پروفایل عضو تیم از دیتابیس بر اساس شناسه (نیازمند دسترسی ادمین)."
)
async def delete_team_member(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TeamMember).where(TeamMember.id == id))
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="عضو مورد نظر در تیم یافت نشد."
        )

    await db.delete(member)
    await db.commit()

    return {"message": "عضو تیم با موفقیت حذف شد."}