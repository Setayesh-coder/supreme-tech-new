import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles

from app.api.v1 import api_v1_router

app = FastAPI(
    title="Supreme Tech API",
    description="سرویس‌ها و وب‌سرویس‌های اختصاصی سامانه سپریم تک",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# تنظیمات CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# اطمینان از وجود پوشه static و mount کردن آن
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ثبت استاندارد و تک‌مسیره اندپوئینت‌های نسخه v1
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "online",
        "service": "Supreme Tech API Backend",
        "version": "1.0.0"
    }


# تنظیمات سفارشی Swagger برای استفاده مستقیم از HTTP Bearer Token
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "توکن JWT خود را بدون کلمه Bearer وارد کنید."
        }
    }
    openapi_schema["security"] = [{"HTTPBearer": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi