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
  Ticket,
  ChevronLeft,
  ImageOff,
  Flame,
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

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}${imagePath}`;
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

// 🔥 چند روز تا برگزاری رویداد مانده — برای نمایش نشان شمارش‌معکوس
const getDaysLeft = (dateString: string) => {
  const diffMs = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// 🔥 رنگ نوار ظرفیت بر اساس درصد پر شدن (اطلاعات واقعی، نه صرفاً تزیین)
const getCapacityColor = (ratio: number) => {
  if (ratio >= 0.9) return "bg-red-400";
  if (ratio >= 0.6) return "bg-amber-400";
  return "bg-emerald-400";
};

function EventCardSkeleton() {
  return (
    <LiquidGlassCard
      className="overflow-hidden h-full"
      borderRadius="16px"
      blurIntensity="sm"
      glowIntensity="sm"
    >
      <div className="h-48 bg-white/5 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
        <div className="h-9 w-full bg-white/10 rounded-full animate-pulse mt-4" />
      </div>
    </LiquidGlassCard>
  );
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAll({ limit: 20 });
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
    if (filter === "upcoming") return new Date(event.date) > new Date();
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

  const handleImageError = (eventId: string) => {
    setImageErrors((prev) => ({ ...prev, [eventId]: true }));
  };

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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
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
              const daysLeft = getDaysLeft(event.date);
              const enrolled = event._count?.enrollments || 0;
              const ratio = event.capacity > 0 ? enrolled / event.capacity : 0;
              const isFull = enrolled >= event.capacity && event.capacity > 0;

              return (
                <LiquidGlassCard
                  key={event.id}
                  className="overflow-hidden h-full group flex flex-col"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                  hoverScale={1.03}
                >
                  {event.image && imageUrl && !hasError ? (
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => handleImageError(event.id)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

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

                      {/* 🔥 نشان شمارش‌معکوس — فقط وقتی معنادار است نمایش داده می‌شود */}
                      {daysLeft >= 0 && daysLeft <= 14 && (
                        <div className="absolute bottom-3 right-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/50 text-orange-300 backdrop-blur-sm flex items-center gap-1 border border-orange-400/30">
                            <Flame className="w-3 h-3" />
                            {daysLeft === 0
                              ? "امروز برگزار می‌شود"
                              : `${daysLeft} روز مانده`}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex flex-col items-center justify-center gap-2">
                      <ImageOff className="w-12 h-12 text-white/20" />
                      <span className="text-white/30 text-sm">بدون تصویر</span>
                    </div>
                  )}

                  <div className="p-6 space-y-3 flex flex-col flex-1">
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

                    {event.location && (
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    )}

                    {/* 🔥 نوار ظرفیت — رنگ بر اساس میزان پر شدن تغییر می‌کند */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {enrolled} / {event.capacity} نفر
                        </span>
                        {isFull && (
                          <span className="text-red-400 font-medium">
                            تکمیل ظرفیت
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getCapacityColor(ratio)}`}
                          style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                      <span className="text-lg font-bold text-white">
                        {event.price === 0 ? (
                          <span className="text-green-400 text-sm">رایگان</span>
                        ) : (
                          `${event.price.toLocaleString()} تومان`
                        )}
                      </span>

                      {event.slug ? (
                        <Link to={`/events/${event.slug}`}>
                          <GlassButton
                            variant="primary"
                            size="sm"
                            disabled={isFull}
                            icon={<Ticket className="w-4 h-4" />}
                            iconPosition="left"
                            className="!rounded-full !px-4 !py-1.5"
                          >
                            {isFull ? "تکمیل" : "ثبت نام"}
                          </GlassButton>
                        </Link>
                      ) : (
                        <GlassButton
                          disabled
                          variant="primary"
                          size="sm"
                          icon={<Ticket className="w-4 h-4" />}
                          iconPosition="left"
                          className="!rounded-full !px-4 !py-1.5"
                        >
                          ثبت نام
                        </GlassButton>
                      )}
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
