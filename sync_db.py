# sync_db.py
import asyncio
from app.core.database import engine
from app.models import BaseModel


async def init_db():
    print("⏳ در حال همگام‌سازی دیتابیس و ساخت جداول...")
    async with engine.begin() as conn:
        # ایجاد کلیه جداول ثبت‌شده در BaseModel
        await conn.run_sync(BaseModel.metadata.create_all)
    print("✅ تمامی جداول دیتابیس با موفقیت ساخته/همگام شدند.")


if __name__ == "__main__":
    asyncio.run(init_db())