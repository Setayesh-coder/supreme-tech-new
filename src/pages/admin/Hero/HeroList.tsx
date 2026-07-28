// src/pages/admin/Hero/HeroList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { OptimizedImage } from "../../../components/ui/OptimizedImage";
import { heroAPI } from "../../../lib/api/hero";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Image,
  Check,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  color?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function HeroList() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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
    if (!confirm("آیا از حذف این اسلاید مطمئن هستید؟")) return;
    try {
      await heroAPI.delete(id);
      setSlides(slides.filter((s) => s.id !== id));
    } catch (err) {
      alert("خطا در حذف اسلاید");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await heroAPI.update(id, { isActive: !currentStatus });
      setSlides(
        slides.map((s) =>
          s.id === id ? { ...s, isActive: !currentStatus } : s,
        ),
      );
    } catch (err) {
      alert("خطا در تغییر وضعیت");
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const index = slides.findIndex((s) => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === slides.length - 1)
    )
      return;

    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[index],
    ];

    // به‌روزرسانی order
    const updatedSlides = newSlides.map((s, i) => ({ ...s, order: i }));
    setSlides(updatedSlides);

    try {
      await heroAPI.reorder(
        updatedSlides.map((s) => ({ id: s.id, order: s.order })),
      );
    } catch (err) {
      console.error("خطا در ذخیره ترتیب:", err);
      fetchSlides();
    }
  };

  const handleImageError = (slideId: string) => {
    setImageErrors((prev) => ({ ...prev, [slideId]: true }));
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              🎨 مدیریت اسلایدها
            </h1>
            <p className="text-white/60 text-sm">اسلایدهای صفحه اصلی</p>
          </div>
          <Link to="/admin/hero/create">
            <GlassButton
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              اسلاید جدید
            </GlassButton>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {slides.map((slide, index) => {
            const hasError = imageErrors[slide.id];
            
            return (
              <LiquidGlassCard
                key={slide.id}
                className="p-4"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {/* 🔥 تصویر با OptimizedImage */}
                  <div className="w-32 h-20 bg-white/5 rounded-lg overflow-hidden shrink-0">
                    {slide.image && !hasError ? (
                      <OptimizedImage
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full"
                        objectFit="cover"
                        quality={80}
                        loading="lazy"
                        fallback="https://via.placeholder.com/128x80?text=No+Image"
                        placeholder={false}
                        onError={() => handleImageError(slide.id)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <Image className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* اطلاعات */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {slide.title}
                        </h3>
                        {slide.subtitle && (
                          <p className="text-sm text-gray-400">
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {slide.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            slide.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {slide.isActive ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" /> فعال
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <X className="w-3 h-3" /> غیرفعال
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          ترتیب: {slide.order + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      {slide.buttonText && <span>🔗 {slide.buttonText}</span>}
                      {slide.color && (
                        <span className="flex items-center gap-1">
                          🎨
                          <span
                            className="w-4 h-4 rounded-full border border-white/10"
                            style={{ backgroundColor: slide.color }}
                          />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* عملیات */}
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      onClick={() => handleMove(slide.id, "up")}
                      disabled={index === 0}
                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      onClick={() => handleMove(slide.id, "down")}
                      disabled={index === slides.length - 1}
                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(slide.id, slide.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        slide.isActive
                          ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
                          : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                      }`}
                    >
                      {slide.isActive ? <X size={18} /> : <Check size={18} />}
                    </button>
                    <Link to={`/admin/hero/edit/${slide.id}`}>
                      <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            );
          })}
        </div>

        {slides.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">هیچ اسلایدی ایجاد نشده است</p>
            <p className="text-sm text-gray-600">اولین اسلاید را اضافه کنید</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}