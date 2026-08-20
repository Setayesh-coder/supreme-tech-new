// src/pages/admin/Hero/HeroCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { heroAPI } from "../../../lib/api/hero";
import { uploadAPI } from "../../../lib/api/upload";
import {
  ArrowLeft,
  Save,
  Image,
  HelpCircle,
  Loader2,
  X,
  Upload,
} from "lucide-react";

export default function HeroCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    // ❌ رنگ در بک‌اند وجود نداره، حذف شد
    order: 0,
    isActive: true,
    tagline: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("لطفاً یک فایل تصویری انتخاب کنید");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  // ✅ اصلاح: تابع آپلود با مدیریت خطای دقیق
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(file, "hero");
      // console.log("✅ تصویر آپلود شد:", response.url);
      return response.url;
    } catch (error: any) {
      console.error("❌ خطا در آپلود:", error);

      // ✅ نمایش خطای دقیق از بک‌اند
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map((e: any) => e.msg).join(", "));
      }
      throw new Error(detail || "خطا در آپلود تصویر");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ آپلود تصویر
      let imageUrl = "";
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (uploadError: any) {
          setError(uploadError.message || "خطا در آپلود تصویر");
          setLoading(false);
          return;
        }
      }

      // ✅ چک کردن وجود تصویر
      if (!imageUrl) {
        setError("لطفاً یک تصویر انتخاب کنید");
        setLoading(false);
        return;
      }

      // ✅ ساخت داده مطابق با Schema بک‌اند
      const slideData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        image_url: imageUrl,
        button_text: formData.buttonText?.trim() || undefined,
        button_link: formData.buttonLink?.trim() || undefined,
        tagline: formData.tagline?.trim() || undefined, // ✅ اضافه شد
        order: Number(formData.order) || 0,
        is_active: formData.isActive !== undefined ? formData.isActive : true,
      };

      // console.log("📤 ارسال اسلاید:", slideData);

      await heroAPI.create(slideData);

      // ✅ پیام موفقیت
      alert("✅ اسلاید با موفقیت ایجاد شد!");
      navigate("/admin/hero");
    } catch (err: any) {
      console.error("❌ خطا:", err);
      console.error("📄 پاسخ خطا:", err.response?.data);

      // ✅ نمایش خطای دقیق
      let errorMessage = "خطا در ایجاد اسلاید";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => e.msg).join(", ");
        } else {
          errorMessage = detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/hero")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Image className="w-6 h-6 text-blue-400" />
            ایجاد اسلاید جدید
          </h1>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="20px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 whitespace-pre-wrap">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* تصویر */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تصویر اسلاید <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-col gap-2">
                {imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview}
                      alt="پیش‌نمایش"
                      className="w-full h-48 object-cover rounded-xl border border-white/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-image.jpg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                    <p className="text-xs text-gray-400 mt-1">
                      {imageFile ? `🆕 ${imageFile.name}` : "تصویر"}
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/20 border-dashed rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors bg-white/5 hover:bg-white/10">
                    <div className="flex flex-col items-center justify-center py-4">
                      {uploading ? (
                        <>
                          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-2" />
                          <p className="text-sm text-blue-400">
                            در حال آپلود...
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-400">
                            برای آپلود کلیک کنید
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WEBP (حداکثر ۵MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* عنوان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                عنوان <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="عنوان اسلاید را وارد کنید"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* زیرعنوان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                زیرعنوان
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="زیرعنوان (اختیاری)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* تگلاین */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تگ بالای اسلاید (Hero Tagline)
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="مثال:  مرکز توسعه فناوری‌های برتر تهران"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                این متن در بالای اسلاید نمایش داده می‌شود
              </p>
            </div>

            {/* توضیحات */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                توضیحات
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="توضیحات کامل اسلاید را وارد کنید..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* دکمه */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  متن دکمه
                </label>
                <input
                  type="text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleChange}
                  placeholder="مثلاً: شروع کنید"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  لینک دکمه
                </label>
                <input
                  type="text"
                  name="buttonLink"
                  value={formData.buttonLink}
                  onChange={handleChange}
                  placeholder="/services یا https://..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* ترتیب و وضعیت */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  ترتیب نمایش
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  عدد کوچکتر = نمایش زودتر
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-400 cursor-pointer">
                  فعال
                </label>
                <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <GlassButton
                type="button"
                variant="white"
                size="md"
                onClick={() => navigate("/admin/hero")}
              >
                انصراف
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="md"
                loading={loading || uploading}
                icon={<Save className="w-5 h-5" />}
                iconPosition="left"
                disabled={loading || uploading}
                className="flex-1"
              >
                {uploading ? "در حال آپلود..." : "ایجاد اسلاید"}
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
