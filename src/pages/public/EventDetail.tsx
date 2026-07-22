// src/pages/public/EventDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { eventsAPI } from "../../lib/api/events";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Ticket,
  ChevronLeft,
  Loader2,
  Share2,
  Heart,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
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

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      try {
        const data = await eventsAPI.getBySlug(slug);
        setEvent(data);
      } catch (err) {
        setError("رویداد مورد نظر یافت نشد");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <LiquidGlassCard
          className="p-8 text-center max-w-md"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-bold text-white mb-2">رویداد یافت نشد</h3>
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

  return (
    <section className="py-12 px-4 md:px-6 relative overflow-hidden min-h-screen">
      {/* پس‌زمینه تزئینی */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto max-w-4xl relative z-10">
        {/* دکمه بازگشت */}
        <Link to="/events" className="inline-block mb-6">
          <LiquidGlassCard
            className="px-4 py-2"
            borderRadius="100px"
            blurIntensity="sm"
            glowIntensity="sm"
            hoverScale={1.05}
          >
            <span className="text-gray-300 flex items-center gap-2 text-sm group">
              <ChevronLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              بازگشت به رویدادها
            </span>
          </LiquidGlassCard>
        </Link>

        {/* کارت اصلی */}
        <LiquidGlassCard
          className="overflow-hidden"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
          shadowIntensity="lg"
        >
          {/* تصویر کاور */}
          {event.image && (
            <div className="relative overflow-hidden h-64 md:h-96">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          {/* محتوا */}
          <div className="p-6 md:p-8 lg:p-10">
            {/* متا اطلاعات */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {formatDate(event.date)}
              </span>
              {event.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock size={16} />
                  {event.duration}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users size={16} />
                {event._count?.enrollments || 0} / {event.capacity} نفر
              </span>
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {event.location}
                </span>
              )}
            </div>

            {/* عنوان */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {event.title}
            </h1>

            {/* توضیحات */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                {event.description}
              </p>
              {event.content && (
                <div
                  className="text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.content }}
                />
              )}
            </div>

            {/* دکمه‌ها */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-white">
                  {event.price === 0 ? (
                    <span className="text-green-400">رایگان</span>
                  ) : (
                    `${event.price.toLocaleString()} تومان`
                  )}
                </span>
                <GlassButton
                  variant="primary"
                  size="lg"
                  icon={<Ticket className="w-5 h-5" />}
                  iconPosition="left"
                  onClick={() => {
                    // ثبت نام در رویداد
                    alert(`ثبت نام در رویداد "${event.title}"`);
                  }}
                >
                  ثبت نام در رویداد
                </GlassButton>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group">
                  <Share2
                    size={18}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </button>
                <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group">
                  <Heart
                    size={18}
                    className="text-gray-400 group-hover:text-red-400 transition-colors"
                  />
                </button>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </section>
  );
}
