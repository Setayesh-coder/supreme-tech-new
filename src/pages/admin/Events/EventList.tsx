// src/pages/admin/events/EventList.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsAPI } from "../../../lib/api/events";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import {
  Calendar,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Check,
  X,
  ImageOff,
  Users,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  date: string;
  capacity: number;
  price: number;
  location?: string;
  type: string;
  featured: boolean;
  isActive: boolean;
  employeeId?: string;
  _count?: {
    enrollments: number;
  };
}

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://supremetech.ir";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // 🔥 تشخیص نوع کاربر
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "ADMIN" || user?.type === "admin";
  const isEmployee = user?.type === "employee" || user?.role === "EMPLOYEE";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsAPI.getAll({
        limit: 50,
      });
      let eventsData = data.events || [];

      // 🔥 اگر کارمند هست، فقط رویدادهای خودش رو ببینه
      if (isEmployee && user?.id) {
        eventsData = eventsData.filter((e: Event) => e.employeeId === user.id);
      }

      setEvents(eventsData);
    } catch (err) {
      setError("خطا در دریافت رویدادها");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این رویداد مطمئن هستید؟")) return;
    try {
      await eventsAPI.delete(id);
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      alert("خطا در حذف رویداد");
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  const handleImageError = (eventId: string) => {
    setImageErrors((prev) => ({ ...prev, [eventId]: true }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              {isEmployee ? "رویدادهای من" : "مدیریت رویدادها"}
            </h1>
            <p className="text-white/60 text-sm">
              {isEmployee
                ? `${events.length} رویداد assigned به شما`
                : `لیست تمام رویدادها (${events.length})`}
            </p>
          </div>
          {isAdmin && (
            <Link to="/admin/events/create">
              <GlassButton
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                iconPosition="left"
              >
                رویداد جدید
              </GlassButton>
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => {
            const imageUrl = getImageUrl(event.image);
            const hasError = imageErrors[event.id];

            return (
              <LiquidGlassCard
                key={event.id}
                className="p-4 hover:bg-white/5 transition-all duration-300"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {event.image && imageUrl && !hasError ? (
                    <img
                      src={imageUrl}
                      alt={event.title}
                      className="w-full md:w-48 h-32 object-cover rounded-xl"
                      onError={() => handleImageError(event.id)}
                    />
                  ) : (
                    <div className="w-full md:w-48 h-32 bg-white/5 rounded-xl flex flex-col items-center justify-center gap-1">
                      <ImageOff className="w-8 h-8 text-white/20" />
                      <span className="text-white/10 text-xs">بدون تصویر</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {event.title}
                        </h3>
                        <p className="text-white/60 text-sm line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            event.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {event.isActive ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" /> فعال
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <X className="w-3 h-3" /> غیرفعال
                            </span>
                          )}
                        </span>
                        {event.featured && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                            ⭐ ویژه
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(event.date)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          📍 {event.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {event._count?.enrollments || 0} / {event.capacity}
                      </span>
                      <span className="flex items-center gap-1">
                        💰{" "}
                        {event.price === 0 ? "رایگان" : `${event.price} تومان`}
                      </span>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    {isAdmin ? (
                      <>
                        <Link to={`/admin/events/edit/${event.id}`}>
                          <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <Link to={`/admin/events/enrollments/${event.id}`}>
                        <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors">
                          <Users size={18} />
                          <span className="text-xs mr-1">ثبت‌نام‌ها</span>
                        </button>
                      </Link>
                    )}
                    {isEmployee && (
                      <Link to={`/admin/events/enrollments/${event.id}`}>
                        <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                          <Users size={18} />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </LiquidGlassCard>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-lg">
              {isEmployee
                ? "هیچ رویدادی به شما اختصاص داده نشده است"
                : "هیچ رویدادی ایجاد نشده است"}
            </p>
            <p className="text-sm text-white/30">
              {isEmployee
                ? "با ادمین تماس بگیرید تا رویدادی به شما اختصاص دهد"
                : "برای شروع، اولین رویداد را ایجاد کنید"}
            </p>
            {isAdmin && (
              <Link to="/admin/events/create">
                <GlassButton variant="primary" size="sm" className="mt-4">
                  ایجاد رویداد جدید
                </GlassButton>
              </Link>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
