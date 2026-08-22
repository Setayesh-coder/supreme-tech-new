// src/pages/public/CourseDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { coursesAPI } from "../../lib/api/courses";
import { enrollmentsAPI } from "../../lib/api/enrollments"; 
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { OptimizedImage } from "../../components/ui/OptimizedImage";
import ShareButton from "../../components/ui/ShareButton";
import {
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ImageOff,
  Award,
  Video,
  FileArchive,
  FileText,
  CheckCircle,
  PlayCircle,
  Download,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";
import { EventDetailSkeleton } from "../../components/skeletons/EventDetailSkeleton";
import CoursePreRegisterModal from "../../components/course/CoursePreRegisterModal";

// ✅ تایپ Course
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  cover_image?: string;
  image?: string;
  price: number;
  duration_hours?: number;
  duration?: string;
  level?: string;
  capacity: number;
  enrolledCount: number;
  startDate?: string;
  endDate?: string;
  is_active: boolean;
  isFeatured: boolean;
  prerequisites?: string[];
  sessions?: Session[];
  userEnrolled?: boolean;
  event?: {
    id: string;
    title: string;
    slug: string;
  };
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

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://supremetech.ir";

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) {
    return `${BASE_URL}${imagePath}`;
  }
  return `${BASE_URL}/${imagePath}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: number) => {
  if (price === 0) return "رایگان";
  return `${price.toLocaleString()} تومان`;
};

const getLevelLabel = (level?: string) => {
  const levels: { [key: string]: string } = {
    BEGINNER: "مبتدی",
    INTERMEDIATE: "متوسط",
    ADVANCED: "پیشرفته",
    EXPERT: "حرفه‌ای",
  };
  return levels[level || ""] || level || "عمومی";
};

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState(true);

  // ✅ State برای مودال پیش‌ثبت‌نام
  const [showPreRegister, setShowPreRegister] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // ✅ تابع بررسی ثبت‌نام از بک‌اند
  const checkUserEnrollment = async (courseId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const enrollments = await enrollmentsAPI.getMyEnrollments();
      return enrollments.some(
        (e: any) => e.course_id === courseId || e.eventId === courseId,
      );
    } catch (error) {
      console.error("❌ خطا در بررسی ثبت‌نام:", error);
      return false;
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) {
        setError("آدرس دوره نامعتبر است");
        setLoading(false);
        return;
      }

      try {
        const foundCourse = await coursesAPI.getBySlug(slug);

        if (foundCourse) {
          // ✅ بررسی ثبت‌نام از بک‌اند
          const userEnrolled = await checkUserEnrollment(foundCourse.id);

          // ✅ نگاشت داده‌ها به تایپ Course
          const mappedCourse: Course = {
            ...foundCourse,
            description: foundCourse.description || "",
            image: foundCourse.cover_image,
            duration: foundCourse.duration_hours
              ? `${foundCourse.duration_hours} ساعت`
              : undefined,
            capacity: (foundCourse as any).capacity || 0,
            enrolledCount: (foundCourse as any).enrolledCount || 0,
            isFeatured: (foundCourse as any).isFeatured || false,
            level: (foundCourse as any).level || undefined,
            userEnrolled: userEnrolled,
            sessions: (foundCourse as any).sessions || [],
            event: (foundCourse as any).event
              ? {
                  id: (foundCourse as any).event.id,
                  title: (foundCourse as any).event.title,
                  slug: (foundCourse as any).event.slug || "",
                }
              : undefined,
          };
          setCourse(mappedCourse);
        } else {
          setError("دوره یافت نشد");
        }
      } catch (err) {
        console.error("❌ خطا:", err);
        setError("دوره مورد نظر یافت نشد");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  // ✅ تابع باز کردن مودال پیش‌ثبت‌نام
  const handleOpenPreRegister = () => {
    if (!course) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("برای ثبت‌نام باید وارد حساب کاربری خود شوید");
      navigate("/login");
      return;
    }

    setSelectedCourseId(course.id);
    setShowPreRegister(true);
  };

  // ✅ تابع بعد از ثبت موفق - فقط از بک‌اند استفاده می‌کند
  const handlePreRegisterSuccess = async () => {
    if (!course) return;

    try {
      // ✅ دوباره از بک‌اند دریافت کن تا وضعیت به‌روز شود
      const userEnrolled = await checkUserEnrollment(course.id);

      // ✅ به‌روزرسانی وضعیت دوره با داده‌های بک‌اند
      setCourse({
        ...course,
        userEnrolled: userEnrolled,
        enrolledCount: (course.enrolledCount || 0) + 1,
      });

      // ✅ نمایش پیام موفقیت
      alert(
        "✅ پیش‌ثبت‌نام با موفقیت انجام شد! دوره به سبد خرید شما اضافه شد.",
      );
    } catch (error) {
      console.error("❌ خطا در به‌روزرسانی وضعیت:", error);
    }
  };

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <LiquidGlassCard
          className="p-6 md:p-8 text-center max-w-md w-full"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {error || "دوره یافت نشد"}
          </h3>
          <p className="text-gray-400 mb-6">دوره مورد نظر شما وجود ندارد</p>
          <Link to="/events">
            <GlassButton variant="primary" size="md">
              بازگشت به رویدادها
            </GlassButton>
          </Link>
        </LiquidGlassCard>
      </div>
    );
  }

  const imageUrl = getImageUrl(course.image || course.cover_image);
  const isFull =
    (course.enrolledCount || 0) >= (course.capacity || 0) &&
    course.capacity > 0;
  const isPast = course.endDate && new Date(course.endDate) < new Date();
  const isActive = course.is_active && !isPast;

  return (
    <section className="py-6 px-3 md:py-12 md:px-6 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-20 right-20 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to={course.event ? `/events/${course.event.slug}` : "/events"}
            className="inline-block mb-4 md:mb-6 mt-10"
          >
            <LiquidGlassCard
              className="px-3 py-1.5 md:px-4 md:py-2"
              borderRadius="9999px"
              blurIntensity="sm"
              glowIntensity="sm"
              hoverScale={1.05}
            >
              <span className="text-gray-300 flex items-center gap-1.5 text-xs md:text-sm group">
                <ChevronLeft
                  size={14}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                {course.event
                  ? `بازگشت به ${course.event.title}`
                  : "بازگشت به رویدادها"}
              </span>
            </LiquidGlassCard>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LiquidGlassCard
            className="overflow-hidden mb-4 md:mb-6"
            borderRadius="24px"
            blurIntensity="lg"
            glowIntensity="md"
            shadowIntensity="lg"
          >
            <div className="relative h-48 sm:h-64 md:h-[420px]">
              {course.image && imageUrl && !imageError ? (
                <>
                  <OptimizedImage
                    src={imageUrl}
                    alt={course.title}
                    className="w-full h-full"
                    objectFit="cover"
                    quality={90}
                    priority={true}
                    loading="eager"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex flex-col items-center justify-center gap-3">
                  <ImageOff className="w-12 h-12 md:w-16 md:h-16 text-white/20" />
                  <span className="text-white/30 text-sm md:text-lg">
                    بدون تصویر
                  </span>
                </div>
              )}

              <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-wrap gap-1.5 md:gap-2">
                {course.isFeatured && (
                  <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-yellow-500/90 text-white backdrop-blur-sm shadow-lg">
                    ⭐ ویژه
                  </span>
                )}
                {course.level && (
                  <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-purple-500/90 text-white backdrop-blur-sm shadow-lg">
                    {getLevelLabel(course.level)}
                  </span>
                )}
              </div>

              <div className="absolute bottom-0 right-0 left-0 p-4 md:p-6 lg:p-8">
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 md:mb-3 line-clamp-3 drop-shadow-lg p-2">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-200">
                  {course.startDate && (
                    <span className="flex items-center gap-1 md:gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Calendar size={14} className="md:w-4 md:h-4" />
                      {formatDate(course.startDate)}
                    </span>
                  )}
                  {course.duration && (
                    <span className="flex items-center gap-1 md:gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Clock size={14} className="md:w-4 md:h-4" />
                      {course.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1 md:gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Users size={14} className="md:w-4 md:h-4" />
                    {course.enrolledCount || 0} / {course.capacity || 0} نفر
                  </span>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LiquidGlassCard
                className="p-4 md:p-6 lg:p-8"
                borderRadius="24px"
                blurIntensity="lg"
                glowIntensity="md"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    درباره دوره
                  </h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">
                    {course.description}
                  </p>
                  {course.content && (
                    <div
                      className="text-gray-300 leading-relaxed text-sm md:text-base"
                      dangerouslySetInnerHTML={{ __html: course.content }}
                    />
                  )}
                </div>

                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                      پیش‌نیازها:
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {course.prerequisites.map((prereq, index) => (
                        <li
                          key={index}
                          className="text-xs px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full"
                        >
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </LiquidGlassCard>
            </motion.div>

            {course.userEnrolled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <LiquidGlassCard
                  className="p-4 md:p-6 lg:p-8"
                  borderRadius="24px"
                  blurIntensity="lg"
                  glowIntensity="md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-400" />
                      <h2 className="text-lg md:text-xl font-bold text-white">
                        جلسات دوره
                      </h2>
                    </div>
                    <button
                      onClick={() => setExpandedSessions(!expandedSessions)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedSessions ? "بستن" : "نمایش همه"}
                    </button>
                  </div>

                  {course.sessions && course.sessions.length > 0 ? (
                    <div className="space-y-3">
                      {course.sessions.map((session, index) => {
                        const isSessionPast =
                          new Date(session.date) < new Date();
                        const isSessionToday =
                          new Date(session.date).toDateString() ===
                          new Date().toDateString();

                        return (
                          <div
                            key={session.id}
                            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    جلسه {index + 1}
                                  </span>
                                  <h4 className="text-sm font-medium text-white">
                                    {session.title}
                                  </h4>
                                </div>
                                {session.description && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {session.description}
                                  </p>
                                )}
                              </div>
                              {session.isCompleted ? (
                                <span className="text-green-400 text-xs flex items-center gap-1">
                                  <CheckCircle size={12} />
                                  برگزار شده
                                </span>
                              ) : isSessionToday ? (
                                <span className="text-orange-400 text-xs flex items-center gap-1">
                                  <Clock size={12} />
                                  امروز
                                </span>
                              ) : (
                                <span className="text-blue-400 text-xs flex items-center gap-1">
                                  <Clock size={12} />
                                  آینده
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(session.date)}
                              </span>
                              {session.time && <span>⏰ {session.time}</span>}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {session.isCompleted && session.meetingLink && (
                                <a
                                  href={session.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-full transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <PlayCircle size={12} />
                                  ورود به جلسه
                                </a>
                              )}

                              {isSessionPast && session.archiveLink && (
                                <a
                                  href={session.archiveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1 rounded-full transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FileArchive size={12} />
                                  آرشیو جلسه
                                </a>
                              )}

                              {session.files && session.files.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                  <FileText size={12} />
                                  {session.files.length} فایل
                                </span>
                              )}
                            </div>

                            {session.files && session.files.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {session.files.map((file) => (
                                  <a
                                    key={file.id}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Download size={12} />
                                    {file.name}
                                    {file.size && (
                                      <span className="text-gray-500 text-[10px]">
                                        ({Math.round(file.size / 1024)} KB)
                                      </span>
                                    )}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      هنوز جلسه‌ای برای این دوره تعیین نشده است
                    </p>
                  )}
                </LiquidGlassCard>
              </motion.div>
            )}
          </div>

          <motion.div
            className="lg:sticky lg:top-6 space-y-3 md:space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LiquidGlassCard
              className="p-4 md:p-6"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
              shadowIntensity="lg"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <span className="text-2xl font-bold text-white">
                  {formatPrice(course.price)}
                </span>
                <ShareButton
                  title={course.title}
                  excerpt={course.description}
                  url={window.location.href}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">وضعیت</span>
                  {course.userEnrolled ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <CheckCircle size={16} />
                      ثبت‌نام شده
                    </span>
                  ) : isPast ? (
                    <span className="text-gray-500">به پایان رسیده</span>
                  ) : isFull ? (
                    <span className="text-red-400">تکمیل ظرفیت</span>
                  ) : isActive ? (
                    <span className="text-green-400">در حال برگزاری</span>
                  ) : (
                    <span className="text-yellow-400">در انتظار شروع</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">ظرفیت</span>
                  <span className="text-white">
                    {course.enrolledCount || 0} / {course.capacity || 0} نفر
                  </span>
                </div>

                {course.level && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">سطح</span>
                    <span className="text-white">
                      {getLevelLabel(course.level)}
                    </span>
                  </div>
                )}

                {course.duration && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">مدت زمان</span>
                    <span className="text-white">{course.duration}</span>
                  </div>
                )}
              </div>

              {!course.userEnrolled && isActive && !isFull && !isPast && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <GlassButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleOpenPreRegister}
                    icon={<ShoppingBag className="w-5 h-5" />}
                    iconPosition="left"
                  >
                    افزودن به سبد خرید
                  </GlassButton>
                </div>
              )}

              {course.userEnrolled && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                    <p className="text-green-400 text-sm flex items-center justify-center gap-2">
                      <CheckCircle size={16} />
                      شما در این دوره ثبت‌نام کرده‌اید
                    </p>
                  </div>
                </div>
              )}
            </LiquidGlassCard>

            {course.event && (
              <LiquidGlassCard
                className="p-4 md:p-6"
                borderRadius="24px"
                blurIntensity="lg"
                glowIntensity="md"
                shadowIntensity="lg"
              >
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  رویداد مرتبط
                </h3>
                <Link
                  to={`/events/${course.event.slug}`}
                  className="block text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Award size={16} />
                    <span>{course.event.title}</span>
                  </div>
                </Link>
              </LiquidGlassCard>
            )}
          </motion.div>
        </div>
      </div>

      {/* ✅ مودال پیش‌ثبت‌نام */}
      <CoursePreRegisterModal
        isOpen={showPreRegister}
        onClose={() => setShowPreRegister(false)}
        course_id={selectedCourseId}
        courseTitle={course?.title || ""}
        onSuccess={handlePreRegisterSuccess}
      />
    </section>
  );
}
