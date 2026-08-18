// src/components/sections/CourseList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { coursesAPI } from "../../lib/api/courses";
import CoursePreRegisterModal from "../course/CoursePreRegisterModal";
import {
  ShoppingBag,
  CheckCircle,
  Loader2,
  User,
  Users,
  Clock,
  Star,
  Award,
  ListSortAscending,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  price: number;
  duration_hours?: number;
  level?: string;
  capacity: number;
  enrolledCount: number;
  isActive: boolean;
  isFeatured: boolean;
  sessions?: Session[];
  userEnrolled?: boolean;
  instructor_name?: string;
  image?: string;
  duration?: string;
  endDate?: string;
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

export default function CourseList({ eventId, eventTitle }: CourseListProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // ✅ State برای مودال پیش‌ثبت‌نام
  const [showPreRegister, setShowPreRegister] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>("");

  useEffect(() => {
    fetchCourses();
  }, [eventId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await coursesAPI.getAll({
        eventId: eventId,
        isActive: true,
        limit: 100,
      });

      const fetchedCourses = data.items || [];

      const coursesWithEnrollment: Course[] = fetchedCourses.map(
        (course: any) => ({
          ...course,
          image: course.cover_image,
          duration: course.duration_hours
            ? `${course.duration_hours} ساعت`
            : undefined,
          capacity: course.capacity || 0,
          enrolledCount: course.enrolledCount || 0,
          isFeatured: course.isFeatured || false,
          level: course.level || undefined,
          userEnrolled: checkUserEnrollment(course.id),
          sessions: course.sessions || [],
          endDate: course.endDate || undefined,
        }),
      );

      setCourses(coursesWithEnrollment);
    } catch (err) {
      console.error(" خطا:", err);
      setError("خطا در دریافت دوره‌ها");
    } finally {
      setLoading(false);
    }
  };

  const checkUserEnrollment = (courseId: string): boolean => {
    const enrollments = JSON.parse(localStorage.getItem("enrollments") || "[]");
    return enrollments.includes(courseId);
  };

  // ✅ باز کردن مودال پیش‌ثبت‌نام
  const handleOpenPreRegister = (courseId: string, courseTitle: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("برای ثبت‌نام باید وارد حساب کاربری خود شوید");
      navigate("/login");
      return;
    }

    setSelectedCourseId(courseId);
    setSelectedCourseTitle(courseTitle);
    setShowPreRegister(true);
  };

  // ✅ تابع بعد از ثبت موفق - اضافه کردن به سبد خرید
  const handlePreRegisterSuccess = (courseId: string, courseTitle: string) => {
    // ✅ 1. اضافه کردن به localStorage
    const enrollments = JSON.parse(localStorage.getItem("enrollments") || "[]");
    if (!enrollments.includes(courseId)) {
      enrollments.push(courseId);
      localStorage.setItem("enrollments", JSON.stringify(enrollments));
    }

    // ✅ 2. اضافه کردن به سبد خرید (cart)
    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!cartItems.includes(courseId)) {
      cartItems.push(courseId);
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }

    // ✅ 3. به‌روزرسانی لیست دوره‌ها
    setCourses(
      courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              userEnrolled: true,
              enrolledCount: (c.enrolledCount || 0) + 1,
            }
          : c,
      ),
    );

    // ✅ 4. نمایش پیام موفقیت با گزینه رفتن به سبد خرید
    setSuccess(` دوره "${courseTitle}" به سبد خرید اضافه شد!`);
    setTimeout(() => setSuccess(""), 5000);

    // ✅ 5. بستن مودال
    setShowPreRegister(false);

    // ✅ 6. آپشن: هدایت خودکار به سبد خرید (اختیاری)
    // navigate("/cart");
  };

  // ✅ تابع رفتن به سبد خرید
  const goToCart = () => {
    navigate("/cart");
  };

  const handleCourseClick = (slug: string) => {
    navigate(`/courses/${slug}`);
  };

  const toggleExpand = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

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

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>
              <CheckCircle />
            </span>{" "}
            {success}
          </div>
          <button
            onClick={goToCart}
            className="px-4 py-1.5 bg-green-500/30 hover:bg-green-500/40 text-green-200 rounded-lg text-sm transition-colors flex items-center gap-1"
          >
            <ShoppingBag className="w-4 h-4" />
            مشاهده سبد خرید
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isExpanded = expandedCourse === course.id;
          const isFull =
            (course.enrolledCount || 0) >= (course.capacity || 0) &&
            course.capacity > 0;
          const isPast =
            course.endDate && new Date(course.endDate) < new Date();

          return (
            <LiquidGlassCard
              key={course.id}
              className="p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col h-full"
              borderRadius="16px"
              blurIntensity="lg"
              glowIntensity="sm"
              onClick={() => handleCourseClick(course.slug)}
            >
              {/* ===== تصویر ===== */}
              {course.image && (
                <div className="w-full h-40 flex-shrink-0 overflow-hidden rounded-lg mb-4">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* ===== محتوای اصلی ===== */}
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
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>
                      {course.enrolledCount || 0} /{" "}
                      {course.capacity || "نامحدود"} نفر
                    </span>
                    {isFull && (
                      <span className="text-red-400 text-xs">(تکمیل)</span>
                    )}
                  </div>
                </div>

                {/* ===== قیمت و دکمه ===== */}
                <div className="mt-auto pt-3">
                  {/* قیمت و وضعیت */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-white">
                      {formatPrice(course.price)}
                    </span>
                    {course.userEnrolled ? (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <CheckCircle size={16} />
                        ثبت‌نام شده
                      </span>
                    ) : isPast ? (
                      <span className="text-gray-500 text-sm">پایان یافته</span>
                    ) : isFull ? (
                      <span className="text-red-400 text-sm">تکمیل ظرفیت</span>
                    ) : null}
                  </div>

                  {/* ✅ دکمه پیش‌ثبت‌نام */}
                  {!course.userEnrolled && !isPast && !isFull && (
                    <div onClick={(e) => e.stopPropagation()}>
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
                          : "پیش‌ثبت‌نام و افزودن به سبد خرید"}
                      </GlassButton>
                    </div>
                  )}

                  {/* دکمه مشاهده جلسات */}
                  {course.userEnrolled && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleExpand(course.id)}
                        className="w-full text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center justify-center gap-2 py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg"
                      >
                        {isExpanded ? "بستن جلسات" : "مشاهده جلسات دوره"}
                      </button>
                    </div>
                  )}

                  {/* جلسات دوره */}
                  {isExpanded && course.userEnrolled && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <h5 className="text-sm font-medium text-gray-300 mb-3">
                        جلسات دوره
                      </h5>
                      {course.sessions && course.sessions.length > 0 ? (
                        course.sessions.map((session) => {
                          return (
                            <div
                              key={session.id}
                              className="bg-white/5 rounded-lg p-3 space-y-2"
                            >
                              {/* محتوای جلسه */}
                            </div>
                          );
                        })
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

      {/* ✅ مودال پیش‌ثبت‌نام */}
      <CoursePreRegisterModal
        isOpen={showPreRegister}
        onClose={() => setShowPreRegister(false)}
        courseId={selectedCourseId}
        courseTitle={selectedCourseTitle}
        onSuccess={() =>
          handlePreRegisterSuccess(selectedCourseId, selectedCourseTitle)
        }
      />
    </div>
  );
}
