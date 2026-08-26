// src/pages/admin/Hero/HeroList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { heroAPI } from "../../../lib/api/hero";
import type { HeroSlide } from "../../../lib/api/hero";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "../../../hooks/use-toast";

export default function HeroList() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await heroAPI.getAll();
      setSlides(data);
    } catch (err) {
      setError("خطا در دریافت اسلایدها");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!confirm("آیا از حذف این اسلاید مطمئن هستید؟")) return;
    try {
      await heroAPI.delete(id);
      setSlides(slides.filter((s) => s.id !== id));
    } catch (err) {
      toast.error("خطا در حذف اسلاید");
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    if (!id) return;

    const index = slides.findIndex((s) => s.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === slides.length - 1) return;

    const newSlides = [...slides];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSlides[index], newSlides[newIndex]] = [
      newSlides[newIndex],
      newSlides[index],
    ];

    // ✅ فقط آیتم‌هایی که id دارند را برای reorder بفرست
    const reorderItems = newSlides
      .filter((s) => s.id)
      .map((s, i) => ({ id: s.id!, order: i }));

    try {
      await heroAPI.reorder(reorderItems);
      setSlides(newSlides);
    } catch (err) {
      toast.error("خطا در تغییر ترتیب");
    }
  };

  const filteredSlides = slides.filter(
    (slide) =>
      slide.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slide.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-gray-400 mr-3">در حال بارگذاری...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              مدیریت اسلایدر
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              مدیریت اسلایدهای صفحه اصلی
            </p>
          </div>
          <Link to="/admin/hero/create">
            <GlassButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              اسلاید جدید
            </GlassButton>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجوی اسلایدها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
            ❌ {error}
          </div>
        )}

        {filteredSlides.length === 0 ? (
          <LiquidGlassCard
            className="p-12 text-center"
            borderRadius="16px"
            blurIntensity="sm"
          >
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              اسلایدی یافت نشد
            </h3>
            <p className="text-gray-400">هنوز اسلایدی ایجاد نشده است</p>
          </LiquidGlassCard>
        ) : (
          <div className="space-y-3">
            {filteredSlides.map((slide, index) => (
              <LiquidGlassCard
                key={slide.id || index}
                className="p-4"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                <div className="flex items-center gap-4">
                  {/* تصویر کوچک */}
                  <img
                    src={
                      slide.image_url ||
                      slide.image_url ||
                      "/slides/ai-hero-new.webp"
                    }
                    alt={slide.title}
                    className="w-24 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/slides/ai-hero-new.webp";
                    }}
                  />

                  {/* اطلاعات */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">
                      {slide.title}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                      {slide.subtitle}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${slide.is_active !== false ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                      >
                        {slide.is_active !== false ? "فعال" : "غیرفعال"}
                      </span>
                      <span className="text-xs text-gray-500">
                        ترتیب: {slide.order || 0}
                      </span>
                    </div>
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => slide.id && handleReorder(slide.id, "up")}
                      disabled={index === 0 || !slide.id}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() =>
                        slide.id && handleReorder(slide.id, "down")
                      }
                      disabled={
                        index === filteredSlides.length - 1 || !slide.id
                      }
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown size={16} className="text-white" />
                    </button>
                    <Link to={`/admin/hero/edit/${slide.id || ""}`}>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        iconPosition="left"
                      >
                        ویرایش
                      </GlassButton>
                    </Link>
                    <button
                      onClick={() => slide.id && handleDelete(slide.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
