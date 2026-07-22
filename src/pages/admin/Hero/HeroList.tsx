import { useEffect, useState } from "react";
import { heroAPI } from "../../../lib/api/hero";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import {
  Plus,
  Edit,
  Trash2,
  //   Image,
  MoveUp,
  MoveDown,
  //   Eye,
  //   EyeOff,
} from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
}

export default function HeroList() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await heroAPI.getAll();
        setSlides(data || []);
      } catch (err) {
        setError("خطا در دریافت اسلایدها");
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این اسلاید مطمئن هستید؟")) return;

    try {
      await heroAPI.delete(id, token);
      setSlides(slides.filter((s) => s.id !== id));
    } catch (err) {
      alert("خطا در حذف اسلاید");
    }
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const index = slides.findIndex((s) => s.id === id);
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === slides.length - 1) return;

    const newSlides = [...slides];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSlides[index], newSlides[newIndex]] = [
      newSlides[newIndex],
      newSlides[index],
    ];
    setSlides(newSlides);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              🎨 مدیریت اسلایدها
            </h1>
            <p className="text-white/60 mt-1">اسلایدهای صفحه اصلی</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2">
            <Plus size={18} />
            اسلاید جدید
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {slides.map((slide) => (
            <LiquidGlassCard
              key={slide.id}
              className="p-4 hover:scale-[1.01] transition-all duration-300"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              shadowIntensity="md"
            >
              <div className="flex items-center gap-6">
                <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium">{slide.title}</h3>
                  {slide.subtitle && (
                    <p className="text-white/40 text-sm">{slide.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/40">
                      ترتیب: {slide.order}
                    </span>
                    <span
                      className={`text-xs ${slide.isActive ? "text-green-400" : "text-red-400"}`}
                    >
                      {slide.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMove(slide.id, "up")}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white/60 rounded-lg transition-all duration-200"
                  >
                    <MoveUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMove(slide.id, "down")}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white/60 rounded-lg transition-all duration-200"
                  >
                    <MoveDown size={16} />
                  </button>
                  <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200">
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {slides.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <p className="text-2xl mb-2">🎨</p>
            <p>هنوز اسلایدی ایجاد نشده است</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
