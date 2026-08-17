from app.models.base import BaseModel
from app.models.user import User, UserRole
from app.models.employees import Employee
from app.models.course import Course
from app.models.event import Event
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.coupon import Coupon, CouponUsage, DiscountType
from app.models.order import Order, OrderStatus, PaymentMethod
from app.models.blog import BlogPost, blog_likes
from app.models.hero import HeroSlide
from app.models.partner import Partner
from app.models.team import TeamMember
from app.models.message import Message
from app.models.ticket import Ticket, TicketMessage, TicketStatus, TicketPriority, ticket_members
from app.models.setting import SystemSetting
from app.models.stat import PageView

all = [
    "BaseModel",
    "User",
    "UserRole",
    "Employee",
    "Course",
    "Event",
    "Enrollment",
    "EnrollmentStatus",
    "Coupon",
    "CouponUsage",
    "DiscountType",
    "Order",
    "OrderStatus",
    "PaymentMethod",
    "BlogPost",
    "blog_likes",
    "HeroSlide",
    "Partner",
    "TeamMember",
    "Message",
    "Ticket",
    "TicketMessage",
    "TicketStatus",
    "TicketPriority",
    "ticket_members",
    "SystemSetting",
    "PageView",
]