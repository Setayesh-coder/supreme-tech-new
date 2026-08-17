from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# ساخت موتور ناهمگام PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # موقع توسعه کوئری‌ها را در کنسول چاپ می‌کند
    future=True,
    pool_pre_ping=True,  # بررسی سلامت کانکشن قبل از اجرای کوئری
)

# ساخت Session Factory ناهمگام
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# کلاس پایه برای تمام مدل‌های SQLAlchemy
class Base(DeclarativeBase):
    pass

# Dependency برای تزریق Session دیتابیس در روترهای FastAPI
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()