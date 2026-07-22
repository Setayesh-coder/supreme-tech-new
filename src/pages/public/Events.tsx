// src/pages/public/Events.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsAPI } from "../../lib/api/events";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  Loader2,
  Ticket,
  ChevronLeft,
  ImageOff,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  date: string;
  duration?: string;
  capacity: number;
  price: number;
  location?: string;
  type: string;
  featured: boolean;
  isActive: boolean;
  _count?: {
    enrollments: number;
  };
}

// 🔥 آدرس پایه برای عکس‌ها
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAll({
          limit: 20,
        });
        const activeEvents = (data.events || []).filter(
          (event: Event) => event.isActive === true,
        );
        setEvents(activeEvents);
      } catch (err) {
        setError("خطا در دریافت رویدادها");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    if (filter === "featured") return event.featured;
    if (filter === "upcoming") {
      return new Date(event.date) > new Date();
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      WORKSHOP: "from-blue-500 to-cyan-500",
      COURSE: "from-green-500 to-emerald-500",
      WEBINAR: "from-purple-500 to-pink-500",
      CONFERENCE: "from-orange-500 to-red-500",
      MEETUP: "from-yellow-500 to-amber-500",
      BOOTCAMP: "from-red-500 to-rose-500",
    };
    return colors[type] || "from-gray-500 to-gray-600";
  };

  // 🔥 تابع ساخت آدرس کامل عکس
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  // 🔥 تابع مدیریت خطای عکس
  const handleImageError = (eventId: string) => {
    setImageErrors((prev) => ({ ...prev, [eventId]: true }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-gray-400">بارگذاری رویدادها...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <LiquidGlassCard
          className="p-8 text-center max-w-md"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <div className="text-6xl mb-4">😕</div>
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

  return (
    <section className="py-12 px-4 md:px-6 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="100px"
              glowIntensity="sm"
              className="inline-flex px-4 py-2"
            >
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                رویدادهای Supreme Tech
              </span>
            </LiquidGlassCard>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              📅 رویدادها
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            در رویدادهای ما شرکت کنید و مهارت‌های خود را ارتقا دهید
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
              filter === "all"
                ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            همه رویدادها
          </button>
          <button
            onClick={() => setFilter("featured")}
            className={`px-4 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-1 ${
              filter === "featured"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            <Star className="w-4 h-4" />
            ویژه
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
              filter === "upcoming"
                ? "bg-green-500/20 text-green-400 border border-green-400/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            رویدادهای آینده
          </button>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <LiquidGlassCard
              className="p-12 text-center max-w-md"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                رویدادی یافت نشد
              </h3>
              <p className="text-gray-400">
                {filter === "featured"
                  ? "هنوز رویداد ویژه‌ای برگزار نشده است"
                  : filter === "upcoming"
                    ? "هیچ رویداد آینده‌ای برنامه‌ریزی نشده است"
                    : "به زودی رویدادهای جدید برگزار خواهد شد"}
              </p>
            </LiquidGlassCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const imageUrl = getImageUrl(event.image);
              const hasError = imageErrors[event.id];

              return (
                <LiquidGlassCard
                  key={event.id}
                  className="overflow-hidden h-full group"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                  hoverScale={1.03}
                >
                  {/* 🔥 تصویر با مدیریت خطا */}
                  {event.image && imageUrl && !hasError ? (
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => handleImageError(event.id)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getEventTypeColor(
                            event.type,
                          )}`}
                        >
                          {getEventTypeLabel(event.type)}
                        </span>
                      </div>
                      {event.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/80 text-white backdrop-blur-sm flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            ویژه
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex flex-col items-center justify-center gap-2">
                      <ImageOff className="w-12 h-12 text-white/20" />
                      <span className="text-white/10 text-sm">بدون تصویر</span>
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(event.date)}
                      </span>
                      {event.duration && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {event.duration}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                      {event.title}
                    </h2>

                    <p className="text-gray-400 text-sm line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pt-2">
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {event.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {event._count?.enrollments || 0} / {event.capacity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-lg font-bold text-white">
                        {event.price === 0 ? (
                          <span className="text-green-400 text-sm">رایگان</span>
                        ) : (
                          `${event.price.toLocaleString()} تومان`
                        )}
                      </span>

                      <Link to={`/events/${event.slug}`}>
                        <GlassButton
                          variant="primary"
                          size="sm"
                          icon={<Ticket className="w-4 h-4" />}
                          iconPosition="left"
                          className="rounded-full px-4 py-1.5"
                        >
                          ثبت نام
                        </GlassButton>
                      </Link>
                    </div>
                  </div>
                </LiquidGlassCard>
              );
            })}
          </div>
        )}

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
