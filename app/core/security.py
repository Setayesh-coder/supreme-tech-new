from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

security_scheme = HTTPBearer()
security_scheme_optional = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_jwt_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def parse_user_id(user_id_raw: str):
    """
    تبدیل هوشمند شناسه:
    - اگر رشته عدد باشد، به int تبدیل می‌شود.
    - در غیر این صورت به صورت str بازگردانده می‌شود تا با ستون VARCHAR دیتابیس مطابقت داشته باشد.
    """
    if str(user_id_raw).isdigit():
        return int(user_id_raw)
    
    # حتماً به صورت string بازگردانده می‌شود تا خطای UUID در PostgreSQL ایجاد نشود
    return str(user_id_raw)


async def get_current_user(
    auth: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = auth.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="فیلد sub در توکن موجود نیست."
            )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"اعتبارسنجی توکن ناموفق بود: {str(e)}"
        )

    parsed_id = parse_user_id(user_id_raw)

    result = await db.execute(select(User).where(User.id == parsed_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"کاربری با شناسه '{parsed_id}' در دیتابیس یافت نشد."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="حساب کاربری شما غیرفعال است."
        )

    return user


async def get_optional_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not auth or not auth.credentials:
        return None

    try:
        return await get_current_user(auth=auth, db=db)
    except HTTPException:
        return None
