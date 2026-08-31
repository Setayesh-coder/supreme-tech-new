// src/components/sections/CourseList.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ShoppingCart,
  Timer,
  X,
  Calendar,
  // Zap,
  TrendingUp,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Grid3x3,
  List,
  Play,
  Gift,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "../ui/SafeImage";

// ============================================================
// ✅ اینترفیس‌ها
// ============================================================
interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  price: number;
  original_price: number;
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
// ✅ کامپوننت CourseCard - نسخه Grid (منظم‌تر)
// ============================================================
const GridCourseCard = ({
  course,
  isExpanded,
  onToggleExpand,
  onCourseClick,
  onAddToCart,
  onGoToCart,
  isEnrolling,
  formatPrice,
  formatDate,
}: any) => {
  const hasDiscount = course.discountAmount > 0;
  const isAvailable = !course.userEnrolled && !course.isPast && !course.isFull;
  const hasCapacity = course.capacity > 0;
  const enrolledPercent = hasCapacity
    ? Math.round((course.enrolledCount / course.capacity) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <LiquidGlassCard
        className="p-0 overflow-hidden flex flex-col h-full group cursor-pointer relative"
        borderRadius="24px"
        blurIntensity="lg"
        glowIntensity="sm"
        onClick={() => onCourseClick(course.slug)}
      >
        {/* ===== بخش تصویر با نسبت ثابت ===== */}
        <div className="relative w-full aspect-[16/10] overflow-hidden flex-shrink-0">
          <SafeImage
            src={course.image || course.cover_image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* نشان‌ها */}
          <div className="absolute top-3 right-3 left-3 flex flex-wrap gap-2 justify-end">
            {course.isFeatured && (
              <motion.span
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg flex items-center gap-1"
              >
                <Flame className="w-3 h-3" />
                ویژه
              </motion.span>
            )}
            {course.level && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/90 text-white backdrop-blur-sm shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3" />
                {course.level === "BEGINNER" && "مبتدی"}
                {course.level === "INTERMEDIATE" && "متوسط"}
                {course.level === "ADVANCED" && "پیشرفته"}
                {course.level === "EXPERT" && "حرفه‌ای"}
              </span>
            )}
            {hasDiscount && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg flex items-center gap-1 animate-pulse">
                <Gift className="w-3 h-3" />
                {course.discount_type === "PERCENT"
                  ? `${course.discountPercent}%`
                  : formatPrice(course.discountAmount)}
              </span>
            )}
          </div>

          {/* وضعیت ظرفیت و تاریخ */}
          <div className="absolute bottom-3 right-3 left-3 flex justify-between items-end">
            {hasCapacity && (
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">
                  {course.enrolledCount || 0}/{course.capacity}
                </span>
                {enrolledPercent > 80 && (
                  <span className="text-xs text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded-full">
                    {enrolledPercent}%
                  </span>
                )}
              </div>
            )}
            {course.class_start_date && (
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">
                  {formatDate(course.class_start_date)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ===== محتوای کارت با ارتفاع ثابت ===== */}
        <div className="p-5 flex-1 flex flex-col min-h-[220px]">
          {/* عنوان و توضیحات - فضای ثابت */}
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors min-h-[56px]">
              {course.title}
            </h4>
            {course.description && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-3 min-h-[40px]">
                {course.description}
              </p>
            )}

            {/* اطلاعات دوره - با فاصله ثابت */}
            <div className="flex flex-wrap gap-2 text-sm text-gray-400 min-h-[32px]">
              {course.instructor_name && (
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full">
                  <User size={14} className="text-blue-400" />
                  <span className="text-xs">{course.instructor_name}</span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full">
                  <Clock size={14} className="text-blue-400" />
                  <span className="text-xs">{course.duration}</span>
                </div>
              )}
            </div>
          </div>

          {/* خط جداکننده */}
          <div className="border-t border-white/10 my-3" />

          {/* قیمت و دکمه - بخش پایین ثابت */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(course.price)}
                  </span>
                  {hasDiscount && course.original_price > course.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(course.original_price)}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-green-400 flex items-center gap-1"
                  >
                    <TrendingUp size={12} />
                    {course.discount_type === "PERCENT"
                      ? `${course.discountPercent}% تخفیف`
                      : `${formatPrice(course.discountAmount)} تخفیف`}
                  </motion.span>
                )}
              </div>

              {/* وضعیت - با عرض ثابت */}
              <div className="flex-shrink-0 min-w-[80px] text-left">
                {course.isConfirmed ? (
                  <span className="text-green-400 text-xs flex items-center gap-1 bg-green-500/15 px-2.5 py-1 rounded-full border border-green-500/20">
                    <CheckCircle size={14} />
                    ثبت‌نام شده
                  </span>
                ) : course.isWaiting ? (
                  <span className="text-yellow-400 text-xs flex items-center gap-1 bg-yellow-500/15 px-2.5 py-1 rounded-full border border-yellow-500/20">
                    <Timer size={14} />
                    در انتظار
                  </span>
                ) : course.isPending || course.isInCart ? (
                  <span className="text-blue-400 text-xs flex items-center gap-1 bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-500/20">
                    <ShoppingCart size={14} />
                    در سبد خرید
                  </span>
                ) : course.isPast ? (
                  <span className="text-gray-500 text-xs bg-gray-500/15 px-2.5 py-1 rounded-full border border-gray-500/20">
                    پایان یافته
                  </span>
                ) : course.isFull ? (
                  <span className="text-red-400 text-xs bg-red-500/15 px-2.5 py-1 rounded-full border border-red-500/20">
                    تکمیل ظرفیت
                  </span>
                ) : null}
              </div>
            </div>

            {/* دکمه‌ها */}
            <div onClick={(e) => e.stopPropagation()}>
              {isAvailable && (
                <>
                  {course.isInCart ? (
                    <GlassButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={onGoToCart}
                      icon={<ShoppingCart className="w-4 h-4" />}
                      iconPosition="left"
                      className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 text-blue-400 border-blue-500/30"
                    >
                      مشاهده سبد خرید
                    </GlassButton>
                  ) : (
                    <GlassButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      loading={isEnrolling === course.id}
                      onClick={() => onAddToCart(course.id, course.title)}
                      icon={
                        isEnrolling === course.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )
                      }
                      iconPosition="left"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300"
                    >
                      {isEnrolling === course.id
                        ? "در حال ثبت..."
                        : "افزودن به سبد خرید"}
                    </GlassButton>
                  )}
                </>
              )}

              {course.isConfirmed && (
                <button
                  onClick={() => onToggleExpand(course.id)}
                  className="w-full text-blue-400 hover:text-blue-300 transition-all text-sm flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/20 hover:border-blue-500/40"
                >
                  <BookOpen size={16} />
                  {isExpanded ? "بستن جلسات" : "مشاهده جلسات"}
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              )}

              {course.isWaiting && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                  <p className="text-yellow-400 text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    در انتظار تایید ادمین
                  </p>
                </div>
              )}
            </div>

            {/* جلسات */}
            <AnimatePresence>
              {isExpanded && course.isConfirmed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <h5 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Sparkles size={12} className="text-blue-400" />
                      جلسات دوره
                    </h5>
                    {course.sessions && course.sessions.length > 0 ? (
                      course.sessions.slice(0, 3).map((session: any) => (
                        <div
                          key={session.id}
                          className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <h6 className="text-sm text-white font-medium">
                              {session.title}
                            </h6>
                            <span className="text-xs text-gray-500">
                              {new Date(session.date).toLocaleDateString(
                                "fa-IR",
                              )}
                            </span>
                          </div>
                          {session.meetingLink && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Play size={12} />
                              ورود به جلسه
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-2">
                        هنوز جلسه‌ای تعیین نشده
                      </p>
                    )}
                    {course.sessions?.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{course.sessions.length - 3} جلسه دیگر
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};

// ============================================================
// ✅ کامپوننت CourseCard - نسخه List (بهبودیافته)
// ============================================================
const ListCourseCard = ({
  course,
  onCourseClick,
  onAddToCart,
  onGoToCart,
  isEnrolling,
  formatPrice,
  formatDate,
}: any) => {
  const hasDiscount = course.discountAmount > 0;
  const isAvailable = !course.userEnrolled && !course.isPast && !course.isFull;
  const hasCapacity = course.capacity > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 4 }}
    >
      <LiquidGlassCard
        className="p-4 hover:scale-[1.01] transition-all duration-300 cursor-pointer"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="sm"
        onClick={() => onCourseClick(course.slug)}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* تصویر */}
          <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0 overflow-hidden rounded-xl">
            <SafeImage
              src={course.image || course.cover_image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white">
                {course.discount_type === "PERCENT"
                  ? `${course.discountPercent}%`
                  : formatPrice(course.discountAmount)}
              </span>
            )}
            {course.isFeatured && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-black">
                <Flame className="w-3 h-3 inline" />
                ویژه
              </span>
            )}
          </div>

          {/* محتوا */}
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h4>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                {course.instructor_name && (
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                    <User size={12} className="text-blue-400" />
                    {course.instructor_name}
                  </span>
                )}
                {course.duration && (
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                    <Clock size={12} className="text-blue-400" />
                    {course.duration}
                  </span>
                )}
                {hasCapacity && (
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                    <Users size={12} className="text-blue-400" />
                    {course.enrolledCount || 0}/{course.capacity}
                  </span>
                )}
                {course.class_start_date && (
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                    <Calendar size={12} className="text-blue-400" />
                    {formatDate(course.class_start_date)}
                  </span>
                )}
              </div>
            </div>

            {/* قیمت و دکمه */}
            <div className="flex flex-col items-end gap-2 min-w-[140px]">
              <div className="text-left">
                <span className="text-xl font-bold text-white">
                  {formatPrice(course.price)}
                </span>
                {hasDiscount && course.original_price > course.price && (
                  <span className="text-xs text-gray-500 line-through block">
                    {formatPrice(course.original_price)}
                  </span>
                )}
              </div>

              <div onClick={(e) => e.stopPropagation()} className="w-full">
                {isAvailable && (
                  <>
                    {course.isInCart ? (
                      <GlassButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={onGoToCart}
                        icon={<ShoppingCart className="w-3 h-3" />}
                        iconPosition="left"
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30 text-xs"
                      >
                        سبد خرید
                      </GlassButton>
                    ) : (
                      <GlassButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        loading={isEnrolling === course.id}
                        onClick={() => onAddToCart(course.id, course.title)}
                        icon={
                          isEnrolling === course.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ShoppingBag className="w-3 h-3" />
                          )
                        }
                        iconPosition="left"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 text-xs"
                      >
                        {isEnrolling === course.id ? "..." : "افزودن"}
                      </GlassButton>
                    )}
                  </>
                )}
                {course.isConfirmed && (
                  <span className="text-green-400 text-xs flex items-center justify-center gap-1 bg-green-500/10 px-3 py-1.5 rounded-lg">
                    <CheckCircle size={14} />
                    ثبت‌نام شده
                  </span>
                )}
                {course.isWaiting && (
                  <span className="text-yellow-400 text-xs flex items-center justify-center gap-1 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
                    <Timer size={14} />
                    در انتظار
                  </span>
                )}
                {course.isPast && (
                  <span className="text-gray-500 text-xs bg-gray-500/10 px-3 py-1.5 rounded-lg">
                    پایان یافته
                  </span>
                )}
                {course.isFull && (
                  <span className="text-red-400 text-xs bg-red-500/10 px-3 py-1.5 rounded-lg">
                    تکمیل ظرفیت
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </motion.div>
  );
};

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // ✅ حالت پیش‌فرض List

  const [showPreRegister, setShowPreRegister] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>("");

  const isLoggedIn = !!localStorage.getItem("token");

  const checkIfInCart = useCallback(
    (courseId: string) => {
      if (!cartItems || !Array.isArray(cartItems)) return false;
      return cartItems.some((item: any) => item.course_id === courseId);
    },
    [cartItems],
  );

  const checkUserEnrollment = useCallback(
    async (courseId: string) => {
      if (!isLoggedIn) return { enrolled: false };
      try {
        const enrollments = await enrollmentsAPI.getMyEnrollments();
        const found = enrollments.find(
          (e: any) => e.course_id === courseId || e.eventId === courseId,
        );
        if (found) {
          return { enrolled: true, status: found.status };
        }
        return { enrolled: false };
      } catch (error) {
        console.error("❌ خطا در بررسی ثبت‌نام:", error);
        return { enrolled: false };
      }
    },
    [isLoggedIn],
  );

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

          const originalPrice =
            course.original_price || course.orginal_price || course.price || 0;

          const discountValue = course.discount_value || 0;
          const calculatedDiscount =
            course.price > 0 ? Math.max(0, originalPrice - course.price) : 0;
          const finalDiscountValue =
            discountValue > 0 ? discountValue : calculatedDiscount;

          return {
            ...course,
            original_price: originalPrice,
            discount_value: finalDiscountValue,
            discount_type:
              (course.discount_type as "PERCENT" | "FIXED") ||
              (finalDiscountValue > 0 ? "PERCENT" : "PERCENT"),
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

  // src/components/sections/CourseList.tsx

  // ✅ تابع نمایش Toast با دکمه (نسخه اصلاح‌شده برای Sonner)
  const showToastWithAction = useCallback(
    (message: string, type: "success" | "info" | "error" = "success") => {
      const iconMap = {
        success: "✅",
        info: "🛒",
        error: "❌",
      };

      // ✅ استفاده از toast معمولی با action
      toast(message, {
        icon: iconMap[type],
        duration: 5000,
        style: {
          background: "#1a1a2e",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          backdropFilter: "blur(12px)",
          padding: "16px",
          direction: "rtl",
        },
        action: {
          label: "مشاهده سبد خرید",
          onClick: () => {
            toast.dismiss();
            navigate("/cart");
          },
        },
      });
    },
    [navigate],
  );
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

  const goToCart = useCallback(() => {
    navigate("/cart");
  }, [navigate]);

  const handleCourseClick = useCallback(
    (slug: string) => {
      navigate(`/courses/${slug}`);
    },
    [navigate],
  );

  const toggleExpand = useCallback((courseId: string) => {
    setExpandedCourse((prev) => (prev === courseId ? null : courseId));
  }, []);

  const formatPrice = useCallback((price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  }, []);

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

  const getDiscountInfo = useCallback((course: Course) => {
    const discountAmount = Math.max(
      0,
      (course.original_price || 0) - (course.price || 0),
    );
    const discountPercent =
      course.original_price > 0
        ? Math.round((discountAmount / course.original_price) * 100)
        : 0;
    return { discountAmount, discountPercent };
  }, []);

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

  // آمار دوره‌ها
  const stats = useMemo(() => {
    const total = courses.length;
    const featured = courses.filter((c) => c.isFeatured).length;
    const withDiscount = courses.filter(
      (c) => (c.original_price || 0) > (c.price || 0),
    ).length;
    return { total, featured, withDiscount };
  }, [courses]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-blue-400" />
        </motion.div>
        <p className="text-gray-400 mt-4">در حال بارگذاری دوره‌ها...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      {/* ===== هدر بخش ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white flex items-center gap-3"
          >
            <Award className="w-7 h-7 text-blue-400" />
            دوره‌های آموزشی
            {eventTitle && (
              <span className="text-lg text-gray-400 font-normal">
                ({eventTitle})
              </span>
            )}
          </motion.h3>

          {/* آمار */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mt-2 text-sm"
          >
            <span className="text-gray-400 flex items-center gap-1">
              <BookOpen size={14} className="text-blue-400" />
              {stats.total} دوره
            </span>
            {stats.featured > 0 && (
              <span className="text-yellow-400 flex items-center gap-1">
                <Flame size={14} />
                {stats.featured} ویژه
              </span>
            )}
            {stats.withDiscount > 0 && (
              <span className="text-green-400 flex items-center gap-1">
                <Gift size={14} />
                {stats.withDiscount} با تخفیف
              </span>
            )}
          </motion.div>
        </div>

        {/* کنترل‌های نمایش - با دکمه‌های واضح‌تر */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="bg-white/5 rounded-2xl p-1 flex gap-1 border border-white/5">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-blue-400 shadow-lg shadow-blue-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">لیست</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-blue-400 shadow-lg shadow-blue-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">گرید</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* ===== خطا ===== */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3"
          >
            <X className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== لیست دوره‌ها ===== */}
      <motion.div
        layout
        className={`grid gap-6 ${
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        <AnimatePresence mode="wait">
          {courseStatuses.map((course, index) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {viewMode === "grid" ? (
                <GridCourseCard
                  course={course}
                  isExpanded={expandedCourse === course.id}
                  onToggleExpand={toggleExpand}
                  onCourseClick={handleCourseClick}
                  onAddToCart={handleOpenPreRegister}
                  onGoToCart={goToCart}
                  isEnrolling={enrolling}
                  formatPrice={formatPrice}
                  formatDate={formatDate}
                />
              ) : (
                <ListCourseCard
                  course={course}
                  onCourseClick={handleCourseClick}
                  onAddToCart={handleOpenPreRegister}
                  onGoToCart={goToCart}
                  isEnrolling={enrolling}
                  formatPrice={formatPrice}
                  formatDate={formatDate}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ===== مودال پیش‌ثبت‌نام ===== */}
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
