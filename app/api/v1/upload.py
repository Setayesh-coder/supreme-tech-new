import os
import re
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File

from app.schemas.upload import UploadResponseSchema, DeleteFileRequestSchema
from app.core.security import get_current_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/upload", tags=["آپلود فایل (Upload)"])

BASE_UPLOAD_DIR = os.path.abspath("static/uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}  # SVG جهت امنیت حذف شد
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # حداکثر حجم ۵ مگابایت

# پوشه‌های مجاز کاربران عادی
USER_ALLOWED_FOLDERS = {"avatars", "tickets", "general"}

os.makedirs(BASE_UPLOAD_DIR, exist_ok=True)


def sanitize_folder_name(folder_name: str) -> str:
    """اعتبارسنجی و تمیزسازی نام پوشه جهت جلوگیری از حملات Path Traversal"""
    clean_name = re.sub(r'[^a-zA-Z0-9_\-]', '', folder_name).strip().lower()
    if not clean_name:
        return "general"
    return clean_name


@router.post(
    "/image",
    response_model=UploadResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="آپلود تصویر در پوشه دلخواه (نیازمند احراز هویت)",
    description="آپلود تصویر با کنترل سطح دسترسی بر اساس نوع پوشه."
)
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Query("avatars", description="نام پوشه مقصد (مثلاً: avatars, tickets, hero, blog)"),
    current_user: User = Depends(get_current_user)
):
    clean_folder = sanitize_folder_name(folder)
    is_admin = current_user.role in [UserRole.ADMIN, UserRole.MANAGER]

    # ۱. کنترل دسترسی پوشه‌ها
    if not is_admin and clean_folder not in USER_ALLOWED_FOLDERS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"شما دسترسی لازم برای آپلود در پوشه '{clean_folder}' را ندارید."
        )

    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="فایلی ارسال نشده است.")

    # ۲. بررسی پسوند
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"فرمت فایل مجاز نیست. فرمت‌های پشتیبانی شده: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # ۳. بررسی MIME Type واقعی فایل جهت امنیت بالا
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="نوع محتوای فایل (MIME Type) نامعتبر است."
        )

    # ۴. بررسی حجم فایل
    contents = await file.read()
    file_size = len(contents)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="حجم فایل بیش از حد مجاز است (حداکثر ۵ مگابایت).")

    if file_size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="فایل ارسال شده خالی است.")

    # ۵. ساخت مسیر و ذخیره‌سازی
    target_dir = os.path.join(BASE_UPLOAD_DIR, clean_folder)
    os.makedirs(target_dir, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(target_dir, unique_filename)

    try:
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"خطا در ذخیره‌سازی فایل: {str(e)}")

    file_url = f"/static/uploads/{clean_folder}/{unique_filename}"

    return UploadResponseSchema(
        filename=unique_filename,
        url=file_url,
        content_type=file.content_type,
        size=file_size
    )


@router.delete(
    "/file",
    status_code=status.HTTP_200_OK,
    summary="حذف فایل آپلود شده",
    description="حذف فایل از سرور جهت آزادسازی حافظه با رعایت کامل پروتکل‌های امنیتی."
)
async def delete_file(
    payload: DeleteFileRequestSchema,
    current_user: User = Depends(get_current_user)
):
    raw_url = payload.file_url.strip()

    # ۱. استخراج مسیر نسبی از URL
    relative_path = raw_url.replace("/static/uploads/", "").lstrip("/")
    
    # ۲. ساخت مسیر مطلق روی دیسک
    absolute_target_path = os.path.abspath(os.path.join(BASE_UPLOAD_DIR, relative_path))

    # ۳. جلوگیری از حمله Path Traversal (بررسی اینکه فایل حتما داخل BASE_UPLOAD_DIR باشد)
    if not absolute_target_path.startswith(BASE_UPLOAD_DIR):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="مسیر فایل غیرمجاز است."
        )

    # ۴. بررسی سطح دسترسی حذف
    is_admin = current_user.role in [UserRole.ADMIN, UserRole.MANAGER]
    
    # استخراج نام پوشه فایل درخواست شده
    folder_in_path = relative_path.split("/")[0] if "/" in relative_path else "general"

    if not is_admin and folder_in_path not in USER_ALLOWED_FOLDERS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما مجاز به حذف این فایل نیستید."
        )

    # ۵. بررسی وجود فایل روی دیسک
    if not os.path.exists(absolute_target_path) or not os.path.isfile(absolute_target_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="فایل مورد نظر روی سرور یافت نشد."
        )

    # ۶. حذف فایل
    try:
        os.remove(absolute_target_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطا در حذف فایل: {str(e)}"
        )

    return {"message": "فایل با موفقیت از سرور حذف شد."}