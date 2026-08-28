// src/components/sections/CourseList.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { coursesAPI } from "../../lib/api/courses";
import { enrollmentsAPI } from "../../lib/api/enrollments";
import { useCart } from "../../hooks/useCart";
import CoursePreRegisterModal from "../course/CoursePreRegisterModal";
import {
  ShoppingBag,
  CheckCircle,
  Loader2,
  User,
  Clock,
  Star,
  Award,
  ListSortAscending,
  ShoppingCart,
  Timer,
  Lock,
  X,
  Percent,
  Calendar,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { SafeImage } from "../ui/SafeImage";

// ============================================================
// ✅ اینترفیس‌ها با فیلدهای جدید
// ============================================================
interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  price: number;
  orginal_price: number;
  discount_value: number;
  discount_type: "PERCENT" | "FIXED";
  duration_hours?: number;
  level?: string;
  capacity: number;
  enrolledCount: number;
  isActive: boolean;
  isFeatured: boolean;
  sessions?: Session[];
  userEnrolled?: boolean;
  enrollmentStatus?: "PENDING" | "WAITING" | "CONFIRMED" | "CANCELLED";
  instructor_name?: string;
  image?: string;
  duration?: string;
  endDate?: string;
  registration_start_date?: string;
  registration_end_date?: string;
  class_start_date?: string;
}

interface Session {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  meetingLink?: string;
  archiveLink?: string;
  files?: File[];
  isRecorded: boolean;
  isCompleted: boolean;
}

interface File {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

interface CourseListProps {
  eventId: string;
  eventTitle?: string;
}

// ============================================================
// ✅ کامپوننت اصلی
// ============================================================
export default function CourseList({ eventId, eventTitle }: CourseListProps) {
  const navigate = useNavigate();

  const { items: cartItems, refetch } = useCart();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const [showPreRegister, setShowPreRegister] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>("");

  const isLoggedIn = !!localStorage.getItem("token");

  // ✅ بررسی اینکه آیا دوره در سبد خرید است
  const checkIfInCart = useCallback(
    (courseId: string) => {
      if (!cartItems || !Array.isArray(cartItems)) {
        return false;
      }
      return cartItems.some((item: any) => item.course_id === courseId);
    },
    [cartItems],
  );

  // ✅ بررسی ثبت‌نام کاربر
  const checkUserEnrollment = useCallback(
    async (courseId: string) => {
      if (!isLoggedIn) return { enrolled: false };

      try {
        const enrollments = await enrollmentsAPI.getMyEnrollments();
        const found = enrollments.find(
          (e: any) => e.course_id === courseId || e.eventId === courseId,
        );

        if (found) {
          return {
            enrolled: true,
            status: found.status,
          };
        }
        return { enrolled: false };
      } catch (error) {
        console.error("❌ خطا در بررسی ثبت‌نام:", error);
        return { enrolled: false };
      }
    },
    [isLoggedIn],
  );

  // ✅ دریافت دوره‌ها
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await coursesAPI.getAll({
        eventId: eventId,
        isActive: true,
        limit: 100,
      });

      const fetchedCourses = data.items || [];

      const coursesWithEnrollment: Course[] = await Promise.all(
        fetchedCourses.map(async (course: any) => {
          const { enrolled, status } = await checkUserEnrollment(course.id);
          return {
            ...course,
            image: course.cover_image,
            duration: course.duration_hours
              ? `${course.duration_hours} ساعت`
              : undefined,
            capacity: course.capacity || 0,
            enrolledCount: course.enrolledCount || 0,
            isFeatured: course.isFeatured || false,
            level: course.level || undefined,
            userEnrolled: enrolled,
            enrollmentStatus: status as any,
            sessions: course.sessions || [],
            endDate: course.endDate || undefined,
            registration_start_date:
              course.registration_start_date || undefined,
            registration_end_date: course.registration_end_date || undefined,
            class_start_date: course.class_start_date || undefined,
            discount_type:
              (course.discount_type as "PERCENT" | "FIXED") || "PERCENT",
          };
        }),
      );

      setCourses(coursesWithEnrollment);
    } catch (err) {
      console.error("❌ خطا:", err);
      setError("خطا در دریافت دوره‌ها");
    } finally {
      setLoading(false);
    }
  }, [eventId, checkUserEnrollment]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, cartItems]);

  // ✅ تابع نمایش Toast سفارشی با دکمه
  const showToastWithAction = useCallback(
    (message: string, type: "success" | "info" | "error" = "success") => {
      const iconMap = {
        success: <CheckCircle className="w-6 h-6 text-green-400" />,
        info: <ShoppingCart className="w-6 h-6 text-blue-400" />,
        error: <X className="w-6 h-6 text-red-400" />,
      };

      toast.custom(
        <div className="max-w-md w-full bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5">
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">{iconMap[type]}</div>
              <div className="mr-3 flex-1">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-r border-gray-700">
            <button
              onClick={() => {
                toast.dismiss();
                navigate("/cart");
              }}
              className="w-full border border-transparent rounded-none rounded-l-lg p-4 flex items-center justify-center text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none whitespace-nowrap"
            >
              مشاهده سبد خرید
            </button>
          </div>
        </div>,
        {
          duration: 5000,
        },
      );
    },
    [navigate],
  );

  // ✅ باز کردن مودال ثبت‌نام
  const handleOpenPreRegister = useCallback(
    (courseId: string, courseTitle: string) => {
      if (!isLoggedIn) {
        toast.error("برای ثبت‌نام باید وارد حساب کاربری خود شوید");
        navigate("/login");
        return;
      }

      if (checkIfInCart(courseId)) {
        showToastWithAction("این دوره در سبد خرید شما موجود است", "info");
        return;
      }

      setSelectedCourseId(courseId);
      setSelectedCourseTitle(courseTitle);
      setShowPreRegister(true);
    },
    [isLoggedIn, navigate, checkIfInCart, showToastWithAction],
  );

  // ✅ موفقیت در ثبت‌نام
  const handlePreRegisterSuccess = useCallback(
    async (courseId: string, courseTitle: string) => {
      setEnrolling(courseId);

      try {
        await refetch();

        const { enrolled, status } = await checkUserEnrollment(courseId);

        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  userEnrolled: enrolled,
                  enrollmentStatus: status as any,
                  enrolledCount: (c.enrolledCount || 0) + 1,
                }
              : c,
          ),
        );

        showToastWithAction(
          `✅ دوره "${courseTitle}" به سبد خرید اضافه شد!`,
          "success",
        );

        setShowPreRegister(false);
      } catch (error) {
        console.error("❌ خطا:", error);
        toast.error("خطا در به‌روزرسانی وضعیت ثبت‌نام");
      } finally {
        setEnrolling(null);
      }
    },
    [refetch, checkUserEnrollment, showToastWithAction],
  );

  // ✅ رفتن به سبد خرید
  const goToCart = useCallback(() => {
    navigate("/cart");
  }, [navigate]);

  // ✅ کلیک روی دوره
  const handleCourseClick = useCallback(
    (slug: string) => {
      navigate(`/courses/${slug}`);
    },
    [navigate],
  );

  // ✅ باز/بسته کردن جلسات
  const toggleExpand = useCallback((courseId: string) => {
    setExpandedCourse((prev) => (prev === courseId ? null : courseId));
  }, []);

  // ✅ فرمت قیمت
  const formatPrice = useCallback((price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  }, []);

  // ✅ فرمت تاریخ
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "نامشخص";
    try {
      return new Date(dateString).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "نامشخص";
    }
  }, []);

  // ✅ محاسبه تخفیف
  const getDiscountInfo = useCallback((course: Course) => {
    const discountAmount = (course.orginal_price || 0) - (course.price || 0);
    const discountPercent =
      course.orginal_price > 0
        ? Math.round((discountAmount / course.orginal_price) * 100)
        : 0;
    return { discountAmount, discountPercent };
  }, []);

  // ✅ محاسبه وضعیت‌های هر دوره
  const courseStatuses = useMemo(() => {
    return courses.map((course) => {
      const isInCart = checkIfInCart(course.id);
      const isFull =
        (course.enrolledCount || 0) >= (course.capacity || 0) &&
        course.capacity > 0;
      const isPast = course.endDate && new Date(course.endDate) < new Date();
      const isPending = course.enrollmentStatus === "PENDING";
      const isWaiting = course.enrollmentStatus === "WAITING";
      const isConfirmed = course.enrollmentStatus === "CONFIRMED";
      const { discountAmount, discountPercent } = getDiscountInfo(course);

      return {
        ...course,
        isInCart,
        isFull,
        isPast,
        isPending,
        isWaiting,
        isConfirmed,
        discountAmount,
        discountPercent,
      };
    });
  }, [courses, checkIfInCart, getDiscountInfo]);

  // ============================================================
  // ✅ رندر
  // ============================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="text-gray-400 mr-3">در حال بارگذاری دوره‌ها...</span>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Award className="w-6 h-6 text-blue-400" />
        دوره‌های آموزشی این رویداد
        {eventTitle && (
          <span className="text-lg text-gray-400">({eventTitle})</span>
        )}
      </h3>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 flex items-center gap-2">
          <span>❌</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseStatuses.map((course) => {
          const isExpanded = expandedCourse === course.id;
          const hasDiscount = course.discountAmount > 0;

          return (
            <LiquidGlassCard
              key={course.id}
              className="p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col h-full"
              borderRadius="16px"
              blurIntensity="lg"
              glowIntensity="sm"
              onClick={() => handleCourseClick(course.slug)}
            >
              {/* تصویر */}
              <div className="w-full h-40 flex-shrink-0 overflow-hidden rounded-lg mb-4">
                <SafeImage
                  src={course.image || course.cover_image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* محتوای اصلی */}
              <div className="flex-1 flex flex-col">
                {/* عنوان */}
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-white flex-1 line-clamp-2">
                    {course.title}
                  </h4>
                  {course.isFeatured && (
                    <span className="mr-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      ویژه
                    </span>
                  )}
                </div>

                {/* توضیحات */}
                {course.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {course.description}
                  </p>
                )}

                {/* اطلاعات دوره */}
                <div className="space-y-2 text-sm text-gray-400 flex-1">
                  {course.duration && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>مدت: {course.duration}</span>
                    </div>
                  )}
                  {course.level && (
                    <div className="flex items-center gap-2">
                      <ListSortAscending size={14} />
                      <span>سطح: {course.level}</span>
                    </div>
                  )}
                  {course.instructor_name && (
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>مدرس: {course.instructor_name}</span>
                    </div>
                  )}
                  {/* ✅ تاریخ‌های جدید */}
                  {course.class_start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>
                        شروع کلاس: {formatDate(course.class_start_date)}
                      </span>
                    </div>
                  )}
                </div>

                {/* قیمت و دکمه */}
                <div className="mt-auto pt-3">
                  {/* قیمت و وضعیت */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-bold text-white">
                        {formatPrice(course.price)}
                      </span>
                      {hasDiscount && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(course.orginal_price)}
                          </span>
                          <span className="text-xs text-green-400 flex items-center gap-0.5">
                            <Percent size={12} />
                            {course.discount_type === "PERCENT"
                              ? `${course.discountPercent}%`
                              : formatPrice(course.discountAmount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* نمایش وضعیت ثبت‌نام */}
                    {course.isConfirmed ? (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <CheckCircle size={16} />
                        ثبت‌نام نهایی
                      </span>
                    ) : course.isWaiting ? (
                      <span className="text-yellow-400 text-sm flex items-center gap-1">
                        <Timer size={16} />
                        در انتظار تایید
                      </span>
                    ) : course.isPending ? (
                      <span className="text-blue-400 text-sm flex items-center gap-1">
                        <ShoppingCart size={16} />
                        در سبد خرید
                      </span>
                    ) : course.isInCart ? (
                      <span className="text-blue-400 text-sm flex items-center gap-1">
                        <ShoppingCart size={16} />
                        در سبد خرید
                      </span>
                    ) : course.isPast ? (
                      <span className="text-gray-500 text-sm">پایان یافته</span>
                    ) : course.isFull ? (
                      <span className="text-red-400 text-sm">تکمیل ظرفیت</span>
                    ) : null}
                  </div>

                  {/* دکمه‌های مختلف بر اساس وضعیت */}
                  {!course.userEnrolled && !course.isPast && !course.isFull && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {course.isInCart ? (
                        <GlassButton
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={goToCart}
                          icon={<ShoppingCart className="w-4 h-4" />}
                          iconPosition="left"
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                        >
                          مشاهده سبد خرید
                        </GlassButton>
                      ) : (
                        <GlassButton
                          variant="primary"
                          size="sm"
                          fullWidth
                          loading={enrolling === course.id}
                          onClick={() =>
                            handleOpenPreRegister(course.id, course.title)
                          }
                          icon={
                            enrolling === course.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ShoppingBag className="w-4 h-4" />
                            )
                          }
                          iconPosition="left"
                        >
                          {enrolling === course.id
                            ? "در حال ثبت..."
                            : "افزودن به سبد خرید"}
                        </GlassButton>
                      )}
                    </div>
                  )}

                  {/* در سبد خرید - نمایش دکمه مشاهده سبد خرید */}
                  {course.isPending && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <GlassButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={goToCart}
                        icon={<ShoppingCart className="w-4 h-4" />}
                        iconPosition="left"
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                      >
                        مشاهده سبد خرید
                      </GlassButton>
                    </div>
                  )}

                  {/* در انتظار تایید ادمین */}
                  {course.isWaiting && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
                      <p className="text-yellow-400 text-xs flex items-center justify-center gap-1">
                        <Timer size={14} />
                        در انتظار تایید ادمین
                      </p>
                    </div>
                  )}

                  {/* ثبت‌نام نهایی - نمایش دکمه مشاهده جلسات */}
                  {course.isConfirmed && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleExpand(course.id)}
                        className="w-full text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center justify-center gap-2 py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg"
                      >
                        {isExpanded ? "بستن جلسات" : "مشاهده جلسات دوره"}
                      </button>
                    </div>
                  )}

                  {/* جلسات دوره - فقط برای ثبت‌نام نهایی */}
                  {isExpanded && course.isConfirmed && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <h5 className="text-sm font-medium text-gray-300 mb-3">
                        جلسات دوره
                      </h5>
                      {course.sessions && course.sessions.length > 0 ? (
                        course.sessions.map((session) => (
                          <div
                            key={session.id}
                            className="bg-white/5 rounded-lg p-3 space-y-2 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <h6 className="text-sm text-white">
                                {session.title}
                              </h6>
                              <span className="text-xs text-gray-500">
                                {new Date(session.date).toLocaleDateString(
                                  "fa-IR",
                                )}
                              </span>
                            </div>
                            {session.description && (
                              <p className="text-xs text-gray-400">
                                {session.description}
                              </p>
                            )}
                            {session.meetingLink && (
                              <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Lock size={12} />
                                ورود به جلسه
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          هنوز جلسه‌ای برای این دوره تعیین نشده است
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>

      {/* مودال پیش‌ثبت‌نام */}
      <CoursePreRegisterModal
        isOpen={showPreRegister}
        onClose={() => setShowPreRegister(false)}
        course_id={selectedCourseId}
        courseTitle={selectedCourseTitle}
        onSuccess={() =>
          handlePreRegisterSuccess(selectedCourseId, selectedCourseTitle)
        }
      />
    </div>
  );
}
