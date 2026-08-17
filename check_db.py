# check_db.py
import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal


async def check_connection():
    print("⏳ در حال بررسی اتصال به دیتابیس...")
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            val = result.scalar()
            if val == 1:
                print("✅ اتصال به دیتابیس برقرار است.")
            else:
                print("⚠️ پاسخ نامتوقعی از دیتابیس دریافت شد.")
    except Exception as e:
        print(f"❌ خطا در اتصال به دیتابیس: {e}")


if __name__ == "__main__":
    asyncio.run(check_connection())