// src/pages/public/Events.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  PenTool,
} from "lucide-react";
import { EventsSkeleton } from "../../components/skeletons/EventSkeletons";
import SectionHeader from "../../components/ui/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image?: string;
  image?: string;
  start_date: string;
  end_date?: string;
  capacity: number;
  category?: string;
  type: string;
  featured: boolean;
  is_active: boolean;
  _count?: {
    enrollments: number;
  };
}

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) {
    return `${BASE_URL}${imagePath}`;
  }
  return `${BASE_URL}/${imagePath}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "نامشخص";
  const date = new Date(dateString);
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsAPI.getAll({
          page: currentPage,
          size: 50,
          is_active: true,
        });

        const activeEvents = (data.items || []).map((event: any) => ({
          ...event,
          image: event.cover_image,
          type: event.category || "WORKSHOP",
          featured: event.is_featured || false,
        }));

        setEvents(activeEvents);
        setTotalPages(Math.ceil((data.total || 0) / 50));
      } catch (err) {
        console.error(" خطا:", err);
        setError("خطا در دریافت رویدادها");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage]);

  const filteredEvents = events
    .filter((event) => {
      if (filter === "featured") return event.featured;
      if (filter === "upcoming") return new Date(event.start_date) > new Date();
      return true;
    })
    .filter((event) => {
      if (!searchTerm) return true;
      return (
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const handleImageError = (eventId: string) => {
    setImageErrors((prev) => ({ ...prev, [eventId]: true }));
  };

  const handleCardClick = (slug: string) => {
    if (slug) {
      navigate(`/events/${slug}`);
    }
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
          {/* <div className="text-6xl mb-4">😕</div> */}
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

  if (loading) {
    return <EventsSkeleton />;
  }

  return (
    <section className="py-8 px-4 md:px-6 lg:px-8 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto relative z-10 max-w-7xl">
        <div className="mb-8 mt-10">
          <SectionHeader
            badge="دوره‌ها و رویدادهای Supreme Tech"
            badgeIcon={<Sparkles className="w-4 h-4 text-blue-400" />}
            title="دوره‌های آموزشی"
            subtitle="مهارت‌های خود را با دوره‌های تخصصی ما ارتقا دهید"
            description="از کارگاه‌های عملی تا وبینارهای تخصصی و بوت‌کمپ‌های فشرده"
          />

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
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilter("all")}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        filter === "all"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      همه
                    </button>
                    <button
                      onClick={() => setFilter("upcoming")}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        filter === "upcoming"
                          ? "bg-green-500/20 text-green-400 border border-green-400/30"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      رویدادهای آینده
                    </button>
                    <button
                      onClick={() => setFilter("featured")}
                      className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1 ${
                        filter === "featured"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      ویژه
                    </button>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <LiquidGlassCard
              className="p-12 text-center max-w-md"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="text-6xl mb-4">
                <PenTool />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredEvents.map((event) => {
              const imageUrl = getImageUrl(event.image || event.cover_image);
              const hasError = imageErrors[event.id];

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="cursor-pointer group"
                  onClick={() => handleCardClick(event.slug)}
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    {/* تصویر */}
                    {event.image && imageUrl && !hasError ? (
                      <>
                        <OptimizedImage
                          src={imageUrl}
                          alt={event.title}
                          className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                          objectFit="cover"
                          quality={80}
                          loading="lazy"
                          onError={() => handleImageError(event.id)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex flex-col items-center justify-center">
                        <ImageOff className="w-12 h-12 text-white/20" />
                      </div>
                    )}

                    {/* محتوای روی تصویر */}
                    <div className="absolute bottom-0 right-0 left-0 p-4 md:p-5">
                      {/* عنوان */}
                      <h3 className="text-white font-bold text-base md:text-lg lg:text-xl mb-1.5 line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {event.title}
                      </h3>

                      {/* توضیحات */}
                      <p className="text-gray-300 text-xs md:text-sm line-clamp-2 mb-2 opacity-90">
                        {event.description}
                      </p>

                      {/*  تاریخ به فارسی */}
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar size={14} className="ml-1" />
                        {formatDate(event.start_date)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              قبلی
            </button>
            <span className="text-white px-4 py-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              بعدی
            </button>
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
