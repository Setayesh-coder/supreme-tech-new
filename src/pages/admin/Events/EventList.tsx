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
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { showConfirmToast } from "../../../components/ui/confirm-toast";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image?: string; // ✅ تغییر از image به cover_image
  image?: string; // برای نمایش
  start_date: string;
  end_date: string;
  capacity: number;
  price: number;
  location?: string;
  category?: string; // ✅ تغییر از type به category
  type: string; // برای نمایش
  featured: boolean;
  is_active: boolean; // ✅ تغییر از isActive به is_active
  employeeId?: string;
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

// ✅ تابع formatDate
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

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // ✅ اضافه کردن state های مورد نیاز
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [totalCount, setTotalCount] = useState(0);

  // ✅ تشخیص ادمین بر اساس توکن
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("❌ خطا در parse user:", e);
  }

  const isAdmin = !!token;
  const isEmployee =
    user?.type === "employee" ||
    user?.role === "EMPLOYEE" ||
    user?.role === "employee";

  // console.log("🔐 isAdmin:", isAdmin);
  // console.log("🔐 isEmployee:", isEmployee);
  // console.log("👤 user:", user);
  // console.log("🔑 token:", token ? "وجود دارد" : "ندارد");

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll({
        page: currentPage,
        size: 50,
        search: searchTerm || undefined,
        category: filterCategory || undefined,
        is_active:
          filterStatus !== "all" ? filterStatus === "active" : undefined,
      });

      // ✅ تغییر از data.events به data.items
      const eventsData = (data.items || []).map((event: any) => ({
        ...event,
        image: event.cover_image,
        type: event.category || "WORKSHOP",
        featured: event.is_featured || false,
        is_active: event.is_active !== undefined ? event.is_active : true,
      }));

      setEvents(eventsData);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("❌ خطا:", err);
      setError("خطا در دریافت رویدادها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirmToast({
      title: "آیا از حذف این رویداد مطمئن هستید؟",
      description: "همه اطلاعات مرتبط با این رویداد حذف خواهد شد.",
      variant: "danger",
      confirmText: "بله، حذف شود",
      cancelText: "انصراف",
      onConfirm: async () => {
        try {
          await eventsAPI.delete(id);
          setEvents(events.filter((e) => e.id !== id));
          toast.success("✅ رویداد با موفقیت حذف شد");
        } catch (err) {
          toast.error("❌ خطا در حذف رویداد");
        }
      },
    });
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

        {/* ✅ جستجو و فیلتر */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="جستجوی رویدادها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-400/40 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-blue-400/40 transition-colors"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-blue-400/40 transition-colors"
          >
            <option value="">همه دسته‌ها</option>
            <option value="WORKSHOP">کارگاه</option>
            <option value="COURSE">دوره</option>
            <option value="WEBINAR">وبینار</option>
            <option value="CONFERENCE">کنفرانس</option>
            <option value="MEETUP">دیدار</option>
            <option value="BOOTCAMP">بوت‌کمپ</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => {
            const imageUrl = getImageUrl(event.image || event.cover_image);
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
                            event.is_active
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {event.is_active ? (
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
                        {formatDate(event.start_date)} تا{" "}
                        {formatDate(event.end_date)}
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
                        {event.price === 0
                          ? "رایگان"
                          : `${event.price.toLocaleString()} تومان`}
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

        {/* ✅ صفحه‌بندی */}
        {totalCount > 50 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              قبلی
            </button>
            <span className="text-white px-4 py-2">
              صفحه {currentPage} از {Math.ceil(totalCount / 50)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= Math.ceil(totalCount / 50)}
              className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
