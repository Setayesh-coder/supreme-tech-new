from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.blog import router as blog_router
from app.api.v1.courses import router as courses_router
from app.api.v1.employees import router as employees_router
from app.api.v1.enrollments import router as enrollments_router
from app.api.v1.events import router as events_router
from app.api.v1.hero import router as hero_router
from app.api.v1.messages import router as messages_router
from app.api.v1.partners import router as partners_router
from app.api.v1.settings import router as settings_router
from app.api.v1.stats import router as stats_router
from app.api.v1.team import router as team_router
from app.api.v1.tickets import router as tickets_router
from app.api.v1.upload import router as upload_router
from app.api.v1.cart import router as cart_router
from app.api.v1.admin_coupon import router as admin_coupon_router
from app.api.v1.payments import router as payments_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(blog_router)
api_v1_router.include_router(courses_router)
api_v1_router.include_router(employees_router)
api_v1_router.include_router(enrollments_router)
api_v1_router.include_router(events_router)
api_v1_router.include_router(hero_router)
api_v1_router.include_router(messages_router)
api_v1_router.include_router(partners_router)
api_v1_router.include_router(settings_router)
api_v1_router.include_router(stats_router)
api_v1_router.include_router(team_router)
api_v1_router.include_router(tickets_router)
api_v1_router.include_router(upload_router)
api_v1_router.include_router(cart_router)
api_v1_router.include_router(admin_coupon_router)
api_v1_router.include_router(payments_router)