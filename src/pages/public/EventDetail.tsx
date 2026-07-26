// src/pages/public/EventDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { eventsAPI } from "../../lib/api/events";
import { enrollmentsAPI } from "../../lib/api/enrollments";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
// import LikeButton from "../../components/ui/LikeButton";
import ShareButton from "../../components/ui/ShareButton";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Ticket,
  ChevronLeft,
  ImageOff,
  Flame,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import { EventDetailSkeleton } from "../../components/skeletons/EventDetailSkeleton";
import CountdownTimer from "../../components/ui/CountdownTimer";

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
  meetingLink?: string;
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

const getCapacityColor = (ratio: number) => {
  if (ratio >= 0.9) return "bg-red-400";
  if (ratio >= 0.6) return "bg-amber-400";
  return "bg-emerald-400";
};

const getDaysLeft = (dateString: string) => {
  const diffMs = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

function DetailSkeleton() {
  return (
    <section className="py-12 px-4 md:px-6 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <div className="h-8 w-40 bg-white/5 rounded-full animate-pulse mb-6" />
        <div className="h-72 md:h-[420px] bg-white/5 rounded-3xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(0);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) {
        setError("آدرس رویداد نامعتبر است");
        setLoading(false);
        return;
      }

      try {
        const response = await eventsAPI.getBySlug(slug);

        if (response && response.data) {
          setEvent(response.data);
          setEnrolled(response.data._count?.enrollments || 0);
        } else if (response) {
          setEvent(response);
          setEnrolled(response._count?.enrollments || 0);
        } else {
          setError("رویداد یافت نشد");
        }
      } catch (err) {
        setError("رویداد مورد نظر یافت نشد");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  // بررسی وضعیت ثبت‌نام کاربر
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!event || !user) return;

      try {
        const enrollments = await enrollmentsAPI.getMyEnrollments();
        const found = enrollments.find((e: any) => e.eventId === event.id);

        if (found) {
          setIsUserEnrolled(true);
          setEnrollmentStatus(found.status);
          setEnrolled(found.event?._count?.enrollments || enrolled);
        }
      } catch (err) {
        console.error("خطا در بررسی وضعیت ثبت‌نام:", err);
      }
    };

    if (event && user) {
      checkEnrollmentStatus();
    }
  }, [event, user]);

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
    return <EventDetailSkeleton />;
  }

  const handleRegister = async () => {
    if (!event) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("برای ثبت‌نام باید وارد حساب کاربری خود شوید.");
      navigate("/login");
      return;
    }

    if (isUserEnrolled) {
      alert("شما قبلاً در این رویداد ثبت‌نام کرده‌اید.");
      return;
    }

    setRegistering(true);

    try {
      const result = await enrollmentsAPI.create({
        eventId: event.id,
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });

      console.log("📥 نتیجه ثبت‌نام:", result);

      if (result && result.success && result.data) {
        if (event.price === 0) {
          setEnrolled((prev) => prev + 1);
          setIsUserEnrolled(true);
          alert("✅ ثبت‌نام با موفقیت انجام شد!");
        } else {
          alert(
            "✅ ثبت‌نام انجام شد. لطفاً برای تکمیل فرآیند به سبد خرید بروید.",
          );
          navigate("/cart");
        }
      } else {
        alert(result?.error || "خطا در ثبت‌نام");
      }
    } catch (err: any) {
      console.error("❌ خطا:", err);
      alert(err.response?.data?.error || "خطا در ثبت‌نام");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
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

  const imageUrl = getImageUrl(event.image);
  const totalEnrolled = enrolled;
  const ratio = event.capacity > 0 ? totalEnrolled / event.capacity : 0;
  const isFull = totalEnrolled >= event.capacity && event.capacity > 0;
  const daysLeft = getDaysLeft(event.date);
  const isPast = new Date(event.date) < new Date();
  const eventDate = new Date(event.date);

  return (
    <section className="py-12 px-4 md:px-6 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto max-w-6xl relative z-10">
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

        {/* Hero */}
        <LiquidGlassCard
          className="overflow-hidden mb-6"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
          shadowIntensity="lg"
        >
          <div className="relative h-64 md:h-[420px]">
            {event.image && imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex flex-col items-center justify-center gap-3">
                <ImageOff className="w-16 h-16 text-white/20" />
                <span className="text-white/30 text-lg">بدون تصویر</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute top-4 right-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500">
                {getEventTypeLabel(event.type)}
              </span>
              {daysLeft >= 0 && daysLeft <= 14 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/50 text-orange-300 backdrop-blur-sm flex items-center gap-1 border border-orange-400/30">
                  <Flame className="w-3 h-3" />
                  {daysLeft === 0 ? "امروز" : `${daysLeft} روز مانده`}
                </span>
              )}
            </div>

            <div className="absolute bottom-0 right-0 left-0 p-6 md:p-8">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200">
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
                {event.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* محتوای اصلی */}
          <div className="lg:col-span-2">
            <LiquidGlassCard
              className="p-6 md:p-8"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
            >
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
            </LiquidGlassCard>
          </div>

          {/* 🔥 کارت ثبت‌نام با تایمر شمارش معکوس */}
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* 🔥 تایمر شمارش معکوس - فقط اگر رویداد آینده باشد */}
            {!isPast && eventDate > new Date() && (
              <LiquidGlassCard
                className="p-6"
                borderRadius="24px"
                blurIntensity="lg"
                glowIntensity="md"
                shadowIntensity="lg"
              >
                <div className="text-center mb-4">
                  <CountdownTimer targetDate={eventDate} />
                  <p className="text-sm text-gray-400 mt-2">
                    زمان باقی‌مانده تا شروع رویداد
                  </p>
                </div>
              </LiquidGlassCard>
            )}

            {/* کارت ثبت‌نام */}
            <LiquidGlassCard
              className="p-6"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
              shadowIntensity="lg"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-2xl font-bold text-white">
                  {event.price === 0 ? (
                    <span className="text-green-400">رایگان</span>
                  ) : (
                    `${event.price.toLocaleString()} تومان`
                  )}
                </span>
                {/* 🔥 اشتراک‌گذاری */}
                <div className="flex items-center gap-2">
                  <ShareButton
                    title={event.title}
                    excerpt={event.description}
                    url={window.location.href}
                  />
                </div>
              </div>

              <div className="space-y-1.5 mb-5">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} />
                    {totalEnrolled} / {event.capacity} نفر ثبت‌نام کرده‌اند
                  </span>
                  {isFull && (
                    <span className="text-red-400 font-medium">تکمیل</span>
                  )}
                  {isPast && (
                    <span className="text-gray-500 font-medium">گذشته</span>
                  )}
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getCapacityColor(ratio)}`}
                    style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                  />
                </div>
              </div>

              {/* 🔥 وضعیت ثبت‌نام کاربر */}
              {isUserEnrolled && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-center text-sm">
                  ✅ شما در این رویداد ثبت‌نام کرده‌اید
                  {enrollmentStatus === "PENDING" && (
                    <span className="block text-yellow-400 text-xs mt-1">
                      ⏳ در انتظار پرداخت
                    </span>
                  )}
                </div>
              )}

              {/* 🔥 دکمه ثبت‌نام */}
              <GlassButton
                variant={isUserEnrolled ? "white" : "primary"}
                size="lg"
                disabled={isFull || registering || isPast || isUserEnrolled}
                icon={
                  isUserEnrolled ? (
                    <CheckCircle size={18} />
                  ) : event.price === 0 ? (
                    <Ticket className="w-5 h-5" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )
                }
                iconPosition="left"
                onClick={handleRegister}
                className="w-full justify-center"
              >
                {isUserEnrolled
                  ? "ثبت‌نام شده"
                  : isPast
                    ? "رویداد گذشته"
                    : isFull
                      ? "ظرفیت تکمیل شده"
                      : registering
                        ? "در حال ثبت..."
                        : event.price === 0
                          ? "ثبت نام رایگان"
                          : "ثبت نام و پرداخت"}
              </GlassButton>

              <p className="text-xs text-gray-500 text-center mt-4">
                {event.price === 0
                  ? "با ثبت‌نام، جای خود را در این رویداد قطعی می‌کنید."
                  : "پس از ثبت‌نام، برای تکمیل فرآیند به سبد خرید هدایت می‌شوید."}
              </p>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
