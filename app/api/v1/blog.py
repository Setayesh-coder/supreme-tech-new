from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.blog import BlogPost, blog_likes
from app.schemas.blog import (
    BlogPostCreateSchema, BlogPostUpdateSchema, BlogPostResponseSchema,
    BlogPaginatedResponseSchema, LikeStatusResponseSchema
)

router = APIRouter(prefix="/blog", tags=["وبلاگ (Blog)"])


# تابع کمکی جهت اعتبارسنجی سطح دسترسی ادمین / مدیر
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی لازم برای این عملیات را ندارید."
        )
    return current_user


def format_blog_response(post: BlogPost, likes_count: int = 0) -> dict:
    """تبدیل رشته تگ‌های جداشده با کاما به لیست و آماده‌سازی خروجی"""
    tag_list = [t.strip() for t in post.tags.split(",") if t.strip()] if post.tags else []
    return {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "summary": post.summary,
        "content": post.content,
        "cover_image": post.cover_image,
        "author_name": post.author_name,
        "tags": tag_list,
        "views_count": post.views_count,
        "likes_count": likes_count,
        "published": post.published,
        "created_at": post.created_at,
        "updated_at": post.updated_at
    }


# ------------------------------------------------------------------
# ۱. متدهای عمومی (بدون نیاز به احراز هویت / توکن)
# ------------------------------------------------------------------

@router.get(
    "",
    response_model=BlogPaginatedResponseSchema,
    summary="دریافت لیست پست‌های وبلاگ (عمومی)",
    description="دریافت لیست مقالات منتشرشده به همراه صفحه‌بندی و فیلتر بر اساس تگ."
)
async def get_blogs(
    page: int = Query(1, ge=1, description="شماره صفحه"),
    limit: int = Query(10, ge=1, le=100, description="تعداد در هر صفحه"),
    tag: Optional[str] = Query(None, description="فیلتر بر اساس تگ خاص"),
    db: AsyncSession = Depends(get_db)
):
    query = select(BlogPost).where(BlogPost.published == True)

    if tag:
        query = query.where(BlogPost.tags.contains(tag))

    # محاسبه تعداد کل
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    # اعمال صفحه‌بندی
    offset = (page - 1) * limit
    query = query.order_by(BlogPost.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    posts = result.scalars().all()

    items = []
    for post in posts:
        likes_stmt = select(func.count()).select_from(blog_likes).where(blog_likes.c.blog_id == post.id)
        likes_count = (await db.execute(likes_stmt)).scalar_one()
        items.append(format_blog_response(post, likes_count))

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get(
    "/tags",
    response_model=List[str],
    summary="دریافت تمام تگ‌های وبلاگ (عمومی)",
    description="دریافت لیست کامل و یکتای تمامی تگ‌های استفاده‌شده در مقالات وبلاگ."
)
async def get_blog_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogPost.tags).where(BlogPost.tags.isnot(None)))
    raw_tags = result.scalars().all()

    tags_set = set()
    for tag_str in raw_tags:
        if tag_str:
            for t in tag_str.split(","):
                clean_tag = t.strip()
                if clean_tag:
                    tags_set.add(clean_tag)

    return sorted(list(tags_set))


@router.get(
    "/slug/{slug}",
    response_model=BlogPostResponseSchema,
    summary="دریافت پست بر اساس اسلاگ (عمومی)",
    description="دریافت جزئیات کامل یک مقاله با استفاده از Slug متناظر آن و افزایش تعداد بازدید."
)
async def get_blog_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogPost).where(BlogPost.slug == slug))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="پست مورد نظر یافت نشد.")

    # افزایش تعداد بازدید
    post.views_count += 1
    await db.commit()
    await db.refresh(post)

    likes_stmt = select(func.count()).select_from(blog_likes).where(blog_likes.c.blog_id == post.id)
    likes_count = (await db.execute(likes_stmt)).scalar_one()

    return format_blog_response(post, likes_count)


# ------------------------------------------------------------------
# ۲. متدهای لایک (نیازمند لاگین - کلیه کاربران و ادمین‌ها)
# ------------------------------------------------------------------

@router.post(
    "/{id}/like",
    response_model=LikeStatusResponseSchema,
    summary="لایک / آن‌لایک کردن پست (نیازمند لاگین)",
    description="اگر کاربر قبلاً پست را لایک کرده باشد، آن‌لایک می‌شود و بالعکس (Toggle Like)."
)
async def toggle_like_blog(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    post_check = await db.execute(select(BlogPost.id).where(BlogPost.id == id))
    if not post_check.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="پست مورد نظر یافت نشد.")

    like_stmt = select(blog_likes).where(
        blog_likes.c.user_id == current_user.id,
        blog_likes.c.blog_id == id
    )
    existing_like = (await db.execute(like_stmt)).first()

    if existing_like:
        await db.execute(
            delete(blog_likes).where(
                blog_likes.c.user_id == current_user.id,
                blog_likes.c.blog_id == id
            )
        )
        is_liked = False
    else:
        await db.execute(
            blog_likes.insert().values(user_id=current_user.id, blog_id=id)
        )
        is_liked = True

    await db.commit()

    likes_count_stmt = select(func.count()).select_from(blog_likes).where(blog_likes.c.blog_id == id)
    total_likes = (await db.execute(likes_count_stmt)).scalar_one()

    return {
        "is_liked": is_liked,
        "likes_count": total_likes
    }


@router.get(
    "/{id}/like-status",
    response_model=LikeStatusResponseSchema,
    summary="دریافت وضعیت لایک کاربر روی پست (نیازمند لاگین)",
    description="بررسی اینکه آیا کاربر جاری این پست را لایک کرده است یا خیر."
)
async def get_like_status(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    post_check = await db.execute(select(BlogPost.id).where(BlogPost.id == id))
    if not post_check.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="پست مورد نظر یافت نشد.")

    like_stmt = select(blog_likes).where(
        blog_likes.c.user_id == current_user.id,
        blog_likes.c.blog_id == id
    )
    existing_like = (await db.execute(like_stmt)).first()

    likes_count_stmt = select(func.count()).select_from(blog_likes).where(blog_likes.c.blog_id == id)
    total_likes = (await db.execute(likes_count_stmt)).scalar_one()

    return {
        "is_liked": True if existing_like else False,
        "likes_count": total_likes
    }


# ------------------------------------------------------------------
# ۳. متدهای مدیریتی (فقط ادمین و مدیر)
# ------------------------------------------------------------------

@router.get(
    "/id/{id}",
    response_model=BlogPostResponseSchema,
    summary="دریافت پست بر اساس آیدی جهت ویرایش (فقط ادمین)",
    description="دریافت اطلاعات یک مقاله با استفاده از شناسه (ID) آن برای پنل مدیریت."
)
async def get_blog_by_id(
    id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BlogPost).where(BlogPost.id == id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="پست مورد نظر یافت نشد.")

    likes_stmt = select(func.count()).select_from(blog_likes).where(blog_likes.c.blog_id == post.id)
    likes_count = (await db.execute(likes_stmt)).scalar_one()

    return format_blog_response(post, likes_count)


@router.post(
    "",
    response_model=BlogPostResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="ایجاد پست جدید (فقط ادمین)",
    description="ایجاد مقاله جدید در وبلاگ."
)
async def create_blog(
    data: BlogPostCreateSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    existing_slug = await db.execute(select(BlogPost).where(BlogPost.slug == data.slug))
    if existing_slug.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="مقاله‌ای با این اسلاگ (Slug) قبلاً ثبت شده است."
        )

    tags_str = ",".join(data.tags) if data.tags else None

    new_post = BlogPost(
        title=data.title,
        slug=data.slug,
        summary=data.summary,
        content=data.content,
        cover_image=data.cover_image,
        author_name=data.author_name or "تیم سپریم تک",
        tags=tags_str,
        published=data.published if data.published is not None else True
    )

    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)

    return format_blog_response(new_post, likes_count=0)


@router.put(
    "/{id}",
    response_model=BlogPostResponseSchema,
    summary="ویرایش پست موجود (فقط ادمین)",
    description="بروزرسانی اطلاعات مقاله بر اساس آیدی."
)
async def update_blog(
    id: str,
    data: BlogPostUpdateSchema,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BlogPost).where(BlogPost.id == id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="پست مورد نظر یافت نشد.")

    if data.slug and data.slug != post.slug:
        existing_slug = await db.execute(select(BlogPost).where(BlogPost.slug == data.slug))
        if existing_slug.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="این اسلاگ قبلاً استفاده شده است.")
        post.slug = data.slug

    if data.title is not None: post.title = data.title
    if data.summary is not None: post.summary = data.summary
    if data.content is not None: post.content = data.content
    if data.cover_image is not None: post.cover_image = data.cover_image
    if data.author_name is not None: post.author_name = data.author_name
    if data.tags is not None: post.tags = ",".join(data.tags)
    if data.published is not None: post.published = data.published

    await db.commit()
    await db.refresh(post)

    likes_stmt = select(func.count()).select_from(blog_likes).where(blog_likes.c.blog_id == post.id)
    likes_count = (await db.execute(likes_stmt)).scalar_one()

    return format_blog_response(post, likes_count)


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="حذف پست (فقط ادمین)",
    description="حذف یک مقاله از دیتابیس بر اساس شناسه."
)
async def delete_blog(
    id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BlogPost).where(BlogPost.id == id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="پست مورد نظر یافت نشد.")

    await db.delete(post)
    await db.commit()

    return {"message": "پست وبلاگ با موفقیت حذف شد."}