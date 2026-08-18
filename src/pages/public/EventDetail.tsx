// src/pages/public/EventDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { eventsAPI } from "../../lib/api/events";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { OptimizedImage } from "../../components/ui/OptimizedImage";
import CourseList from "../../components/sections/CourseList";
import ShareButton from "../../components/ui/ShareButton";
import {
  Calendar,
  MapPin,
  // Users,
  Hourglass,
  Clock,
  ChevronLeft,
  ImageOff,
  ArrowLeft,
  Tag,
  CalendarDays,
  Info,
} from "lucide-react";
import { EventDetailSkeleton } from "../../components/skeletons/EventDetailSkeleton";
import CountdownTimer from "../../components/ui/CountdownTimer";
import { motion } from "framer-motion";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  cover_image?: string;
  image?: string;
  start_date: string;
  end_date: string;
  duration?: string;
  capacity: number;
  price: number;
  location?: string;
  category?: string;
  type: string;
  featured: boolean;
  is_active: boolean;
  meetingLink?: string;
  _count?: {
    enrollments: number;
  };
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

const getEventTypeLabel = (type: string) => {
  const types: { [key: string]: string } = {
    WORKSHOP: "کارگاه",
    COURSE: "دوره",
    WEBINAR: "وبینار",
    CONFERENCE: "کنفرانس",
    MEETUP: "دیدار",
    BOOTCAMP: "بوت‌کمپ",
  };
  return types[type] || type;
};

const getDaysLeft = (dateString: string) => {
  const diffMs = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) {
        setError("آدرس رویداد نامعتبر است");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await eventsAPI.getBySlug(slug);

        // ✅ نگاشت داده‌ها به تایپ Event
        const mappedEvent: Event = {
          ...data,
          description: data.description || "",
          image: data.cover_image,
          start_date: data.start_date || new Date().toISOString(),
          end_date: data.end_date || new Date().toISOString(),
          type: (data as any).category || "WORKSHOP",
          featured: (data as any).is_featured || false,
        };
        setEvent(mappedEvent);
      } catch (err) {
        console.error(" خطا:", err);
        setError("رویداد مورد نظر یافت نشد");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "نامشخص";
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <LiquidGlassCard
          className="p-6 md:p-8 text-center max-w-md w-full"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {/* <div className="text-6xl mb-4">😕</div> */}
          <h3 className="text-xl font-bold text-white mb-2">
            {error || "رویداد یافت نشد"}
          </h3>
          <p className="text-gray-400 mb-6">رویداد مورد نظر شما وجود ندارد</p>
          <Link to="/events">
            <GlassButton variant="primary" size="md">
              بازگشت به رویدادها
            </GlassButton>
          </Link>
        </LiquidGlassCard>
      </div>
    );
  }

  const imageUrl = getImageUrl(event.image || event.cover_image);
  // const totalEnrolled = event._count?.enrollments || 0;
  // ✅ استفاده از start_date برای محاسبه روزهای باقی‌مانده
  const daysLeft = getDaysLeft(event.start_date);
  const isPast = new Date(event.end_date) < new Date();
  const eventDate = new Date(event.start_date);

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
          <Link to="/events" className="inline-block mb-4 md:mb-6 mt-10">
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
                بازگشت به رویدادها
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
              {event.image && imageUrl && !imageError ? (
                <>
                  <OptimizedImage
                    src={imageUrl}
                    alt={event.title}
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
                <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                  {getEventTypeLabel(event.type)}
                </span>
                {event.featured && (
                  <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-yellow-500/90 text-white backdrop-blur-sm shadow-lg">
                    ⭐ ویژه
                  </span>
                )}
              </div>

              <div className="absolute bottom-0 right-0 left-0 p-4 md:p-8 lg:p-10">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white leading-tight mb-2 md:mb-3 line-clamp-3 drop-shadow-lg p-2">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-200">
                  <span className="flex items-center gap-1 md:gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Calendar size={14} className="md:w-4 md:h-4" />
                    {formatDate(event.start_date)}
                  </span>
                  {event.duration && (
                    <span className="flex items-center gap-1 md:gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Clock size={14} className="md:w-4 md:h-4" />
                      {event.duration}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1 md:gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                      <MapPin size={14} className="md:w-4 md:h-4" />
                      {event.location}
                    </span>
                  )}
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
                  <Info className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    درباره رویداد
                  </h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">
                    {event.description}
                  </p>
                  {event.content && (
                    <div
                      className="text-gray-300 leading-relaxed text-sm md:text-base"
                      dangerouslySetInnerHTML={{ __html: event.content }}
                    />
                  )}
                </div>
              </LiquidGlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div id="courses-section">
                <CourseList eventId={event.id} eventTitle={event.title} />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="lg:sticky lg:top-6 space-y-3 md:space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {!isPast && eventDate > new Date() && (
              <LiquidGlassCard
                className="p-4 md:p-6"
                borderRadius="24px"
                blurIntensity="lg"
                glowIntensity="md"
                shadowIntensity="lg"
              >
                <div className="text-center">
                  <CountdownTimer targetDate={eventDate} />
                  <p className="text-xs md:text-sm text-gray-400 mt-2">
                    <Hourglass /> زمان باقی‌مانده تا شروع رویداد
                  </p>
                </div>
              </LiquidGlassCard>
            )}

            <LiquidGlassCard
              className="p-4 md:p-6"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
              shadowIntensity="lg"
            >
              <div className="flex items-center justify-between mb-4 md:mb-5 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  <span className="text-sm md:text-base font-medium text-white">
                    اطلاعات رویداد
                  </span>
                </div>
                <ShareButton
                  title={event.title}
                  excerpt={event.description}
                  url={window.location.href}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">تاریخ شروع</p>
                    <p className="text-sm text-white">
                      {formatDate(event.start_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">تاریخ پایان</p>
                    <p className="text-sm text-white">
                      {formatDate(event.end_date)}
                    </p>
                  </div>
                </div>

                {event.duration && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">مدت زمان</p>
                      <p className="text-sm text-white">{event.duration}</p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">مکان</p>
                      <p className="text-sm text-white">{event.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Tag className="w-4 h-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">نوع رویداد</p>
                    <p className="text-sm text-white">
                      {getEventTypeLabel(event.type)}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Users className="w-4 h-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">شرکت‌کنندگان</p>
                    <p className="text-sm text-white">
                      {totalEnrolled} نفر از {event.capacity} نفر
                    </p>
                  </div>
                </div> */}
              </div>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">وضعیت</span>
                  {isPast ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                      به پایان رسیده
                    </span>
                  ) : daysLeft <= 7 ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                      {daysLeft === 0 ? "امروز" : `${daysLeft} روز مانده`}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      در حال برگزاری
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5">
                <button
                  onClick={() => {
                    const courseSection =
                      document.getElementById("courses-section");
                    if (courseSection) {
                      courseSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="w-full text-blue-400 hover:text-blue-300 transition-all text-sm md:text-base flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowLeft size={16} className="md:w-5 md:h-5" />
                  مشاهده دوره‌های مرتبط
                </button>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
