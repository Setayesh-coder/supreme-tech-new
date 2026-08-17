FROM python:3.11-slim

# تنظیم پوشه کاری داخل کانتینر
WORKDIR /app

# نصب ابزارهای مورد نیاز سیستم‌عامل
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# کپی و نصب کتابخانه‌های پایتون
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# کپی کردن تمام فایل‌های پروژه به داخل کانتینر
COPY . .

# باز کردن پورت برنامه
EXPOSE 5001

# دستور اجرای برنامه با uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5001"]