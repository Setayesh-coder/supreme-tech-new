// src/pages/public/Courses.tsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { coursesAPI } from "../../lib/api/courses";
import { eventsAPI } from "../../lib/api/events";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { OptimizedImage } from "../../components/ui/OptimizedImage";
import {
  Calendar,
  ChevronLeft,
  ImageOff,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Users,
  GraduationCap,
} from "lucide-react";
// import { CoursesSkeleton } from "../../components/skeletons/CourseSkeletons";
import SectionHeader from "../../components/ui/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   Types
============================================================ */
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image?: string;
  image?: string;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  price?: number;
  category?: string;
  level?: string;
  instructor?: string;
  is_active: boolean;
  featured?: boolean;
  event_id?: string;
  event?: {
    id: string;
    title: string;
    slug: string;
  };
  _count?: {
    enrollments?: number;
  };
}

interface EventGroup {
  eventId: string | null;
  eventTitle: string;
  eventSlug: string | null;
  courses: Course[];
}

/* ============================================================
   Helpers
============================================================ */
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) {
    return `${BASE_URL}${imagePath}`;
  }
  return `${BASE_URL}/${imagePath}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "نامشخص";
  const date = new Date(dateString);
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return "رایگان";
  if (price === 0) return "رایگان";
  return `${price.toLocaleString("fa-IR")} تومان`;
};

/* ============================================================
   Component
============================================================ */
export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<"all" | "free" | "paid" | "featured">(
    "all",
  );
  const [groupBy, setGroupBy] = useState<"event" | "none">("event");

  /* ------------------------------------------------------------
     Fetch courses + events
  ------------------------------------------------------------ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ۱. همه‌ی دوره‌ها رو بگیر
        const coursesData = await coursesAPI.getAll({
          is_active: true,
        });

        const coursesList: Course[] = (
          Array.isArray(coursesData)
            ? coursesData
            : coursesData.items || coursesData.courses || []
        ).map((course: any) => ({
          ...course,
          image: course.cover_image || course.image,
          featured: course.is_featured || course.featured || false,
        }));

        setCourses(coursesList);

        // ۲. همه‌ی رویدادها رو بگیر (برای عنوان و لینک)
        const eventsData = await eventsAPI.getAll({ is_active: true });
        const eventsList = Array.isArray(eventsData)
          ? eventsData
          : eventsData.items || [];

        const eventsMap: Record<string, any> = {};
        eventsList.forEach((ev: any) => {
          eventsMap[ev.id] = ev;
        });
        setEvents(eventsMap);
      } catch (err) {
        console.error("خطا:", err);
        setError("خطا در دریافت دوره‌ها");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ------------------------------------------------------------
     Filter courses
  ------------------------------------------------------------ */
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        if (filter === "free") return !course.price || course.price === 0;
        if (filter === "paid") return course.price && course.price > 0;
        if (filter === "featured") return course.featured;
        return true;
      })
      .filter((course) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          course.title?.toLowerCase().includes(term) ||
          course.description?.toLowerCase().includes(term) ||
          course.instructor?.toLowerCase().includes(term)
        );
      });
  }, [courses, filter, searchTerm]);

  /* ------------------------------------------------------------
     Group by event
  ------------------------------------------------------------ */
  const groupedCourses: EventGroup[] = useMemo(() => {
    if (groupBy === "none") {
      return [
        {
          eventId: null,
          eventTitle: "",
          eventSlug: null,
          courses: filteredCourses,
        },
      ];
    }

    const groups: Record<string, EventGroup> = {};

    filteredCourses.forEach((course) => {
      const eventId = course.event_id || course.event?.id || "no-event";

      if (!groups[eventId]) {
        const eventData = events[eventId] || course.event;
        groups[eventId] = {
          eventId,
          eventTitle: eventData?.title || "دوره‌های عمومی",
          eventSlug: eventData?.slug || null,
          courses: [],
        };
      }
      groups[eventId].courses.push(course);
    });

    // مرتب‌سازی: رویدادهایی که دوره‌ی بیشتری دارن اول بیان
    return Object.values(groups).sort(
      (a, b) => b.courses.length - a.courses.length,
    );
  }, [filteredCourses, events, groupBy]);

  /* ------------------------------------------------------------
     Handlers
  ------------------------------------------------------------ */
  const handleImageError = (courseId: string) => {
    setImageErrors((prev) => ({ ...prev, [courseId]: true }));
  };

  /* ------------------------------------------------------------
     Loading / Error
  ------------------------------------------------------------ */
  // if (loading) {
  //   return <CoursesSkeleton />;
  // }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <LiquidGlassCard
          className="p-8 text-center max-w-md"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
          <p className="text-gray-400 mb-6">لطفاً دوباره تلاش کنید</p>
          <GlassButton
            variant="primary"
            size="md"
            onClick={() => window.location.reload()}
          >
            تلاش مجدد
          </GlassButton>
        </LiquidGlassCard>
      </div>
    );
  }

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */
  return (
    <section className="py-8 px-4 md:px-6 lg:px-8 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto relative z-10 max-w-7xl">
        {/* Header */}
        <div className="mb-8 mt-10">
          <SectionHeader
            badge="دوره‌های Supreme Tech"
            badgeIcon={<Sparkles className="w-4 h-4 text-blue-400" />}
            title="دوره‌ها"
            subtitle="مهارت‌های خود را با دوره‌های تخصصی ما ارتقا دهید"
            description="از کارگاه‌های عملی تا دوره‌های تخصصی و بوت‌کمپ‌های فشرده"
          />

          {/* Search + Filter toggle */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="جستجوی دوره‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pr-12 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <GlassButton
              variant="secondary"
              size="md"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter className="w-4 h-4" />}
              iconPosition="left"
              className="sm:!w-auto !w-full"
            >
              فیلترها{" "}
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </GlassButton>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <LiquidGlassCard
                  className="p-4 md:p-6"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                >
                  <div className="flex flex-col gap-4">
                    {/* Filter by type */}
                    <div>
                      <p className="text-xs text-gray-400 mb-2">نوع دوره</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: "all", label: "همه" },
                          { key: "free", label: "رایگان" },
                          { key: "paid", label: "پولی" },
                          { key: "featured", label: "ویژه" },
                        ].map((f) => (
                          <button
                            key={f.key}
                            onClick={() => setFilter(f.key as any)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${
                              filter === f.key
                                ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Group by */}
                    <div>
                      <p className="text-xs text-gray-400 mb-2">نمایش</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setGroupBy("event")}
                          className={`px-4 py-2 rounded-lg text-sm transition-all ${
                            groupBy === "event"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                              : "bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          گروه‌بندی بر اساس رویداد
                        </button>
                        <button
                          onClick={() => setGroupBy("none")}
                          className={`px-4 py-2 rounded-lg text-sm transition-all ${
                            groupBy === "none"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                              : "bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          نمایش یکجا
                        </button>
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredCourses.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <LiquidGlassCard
              className="p-12 text-center max-w-md"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="text-6xl mb-4">
                <BookOpen className="w-16 h-16 mx-auto text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                دوره‌ای یافت نشد
              </h3>
              <p className="text-gray-400">
                {searchTerm || filter !== "all"
                  ? "با فیلترهای متفاوت جستجو کنید"
                  : "به زودی دوره‌های جدید برگزار خواهد شد"}
              </p>
            </LiquidGlassCard>
          </div>
        ) : (
          /* Groups */
          <div className="space-y-12">
            {groupedCourses.map((group) => (
              <div key={group.eventId || "no-event"}>
                {/* Event header */}
                {group.eventId && group.eventTitle && (
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-bold text-white">
                          {group.eventTitle}
                        </h2>
                        <p className="text-xs text-gray-400">
                          {group.courses.length} دوره
                        </p>
                      </div>
                    </div>

                    {group.eventSlug && (
                      <Link
                        to={`/events/${group.eventSlug}`}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        مشاهده رویداد
                        <ChevronLeft className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}

                {/* Courses grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {group.courses.map((course) => {
                    const imageUrl = getImageUrl(
                      course.image || course.cover_image,
                    );
                    const hasError = imageErrors[course.id];

                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="cursor-pointer group"
                        onClick={() =>
                          course.slug &&
                          (window.location.href = `/courses/${course.slug}`)
                        }
                      >
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                          {/* Image */}
                          {imageUrl && !hasError ? (
                            <>
                              <OptimizedImage
                                src={imageUrl}
                                alt={course.title}
                                className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                                objectFit="cover"
                                quality={80}
                                loading="lazy"
                                onError={() => handleImageError(course.id)}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex flex-col items-center justify-center">
                              <ImageOff className="w-12 h-12 text-white/20" />
                            </div>
                          )}

                          {/* Content overlay */}
                          <div className="absolute bottom-0 right-0 left-0 p-4 md:p-5">
                            {/* Featured badge */}
                            {course.featured && (
                              <span className="inline-block mb-2 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] border border-yellow-400/30">
                                ویژه
                              </span>
                            )}

                            <h3 className="text-white font-bold text-base md:text-lg lg:text-xl mb-1.5 line-clamp-2 group-hover:text-blue-400 transition-colors">
                              {course.title}
                            </h3>

                            <p className="text-gray-300 text-xs md:text-sm line-clamp-2 mb-2 opacity-90">
                              {course.description}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
                              {course.start_date && (
                                <div className="flex items-center">
                                  <Calendar size={14} className="ml-1" />
                                  {formatDate(course.start_date)}
                                </div>
                              )}

                              <div className="flex items-center gap-3">
                                {course._count?.enrollments !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    {course._count.enrollments}
                                  </span>
                                )}
                                <span
                                  className={
                                    !course.price || course.price === 0
                                      ? "text-green-400"
                                      : "text-blue-400"
                                  }
                                >
                                  {formatPrice(course.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-12">
          <Link to="/">
            <LiquidGlassCard
              className="inline-block px-6 py-3"
              borderRadius="100px"
              blurIntensity="sm"
              glowIntensity="sm"
              hoverScale={1.05}
            >
              <span className="text-gray-300 flex items-center gap-2">
                <ChevronLeft size={18} />
                بازگشت به صفحه اصلی
              </span>
            </LiquidGlassCard>
          </Link>
        </div>
      </div>
    </section>
  );
}
