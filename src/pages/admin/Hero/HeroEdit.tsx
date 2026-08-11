// src/pages/admin/Hero/HeroEdit.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { heroAPI } from "../../../lib/api/hero";
import { uploadAPI } from "../../../lib/api/upload";
import { ArrowLeft, Save, X, Loader2, Image } from "lucide-react";

export default function HeroEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    color: "#3b82f6",
    order: 0,
    isActive: true,
    heroTagline: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");

  useEffect(() => {
    const fetchSlide = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await heroAPI.getById(id);
        console.log("📥 داده اسلاید:", data);
        
        setFormData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          buttonText: data.buttonText || "",
          buttonLink: data.buttonLink || "",
          color: data.color || "#3b82f6",
          order: data.order || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
          heroTagline: data.heroTagline || "",
        });
        
        if (data.image) {
          setCurrentImage(data.image);
          setImagePreview(data.image);
        }
      } catch (err: any) {
        console.error("❌ خطا:", err);
        setError(err.response?.data?.error || "خطا در دریافت اطلاعات اسلاید");
      } finally {
        setLoading(false);
      }
    };
    fetchSlide();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
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
setCurrentImage("");  
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploading(true);
      const response = await uploadAPI.uploadImageWithFormData(formData);
      console.log("✅ تصویر آپلود شد:", response.url);
      return response.url;
    } catch (error) {
      console.error("❌ خطا در آپلود:", error);
      throw new Error("خطا در آپلود تصویر");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = currentImage;
      
      // اگر تصویر جدید آپلود شده
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
if (!imageFile && !currentImage) {
      imageUrl = "";
    }

      const slideData = {
        title: formData.title,
        subtitle: formData.subtitle || "",
        heroTagline: formData.heroTagline || "",
        description: formData.description || "",
        image: imageUrl,
        buttonText: formData.buttonText || "",
        buttonLink: formData.buttonLink || "",
        color: formData.color || "#3b82f6",
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      console.log("📤 ارسال داده برای ویرایش:", slideData);

      await heroAPI.update(id!, slideData);
      setSuccess("✅ اسلاید با موفقیت ویرایش شد!");

      setTimeout(() => {
        navigate("/admin/hero");
      }, 1500);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.error || "خطا در ویرایش اسلاید");
    } finally {
      setSubmitting(false);
    }
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
            ✏️ ویرایش اسلاید
          </h1>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="20px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
              ❌ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 🔥 تصویر - استفاده از img معمولی به جای OptimizedImage */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تصویر اسلاید
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="پیش‌نمایش"
                    className="w-full h-48 object-cover rounded-xl"
                    onError={(e) => {
                      console.error("❌ خطا در لود تصویر:", imagePreview);
                      (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
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
                    {imageFile ? "تصویر جدید" : "تصویر فعلی"}
                  </p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/20 border-dashed rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors bg-white/5 hover:bg-white/10">
                  <div className="flex flex-col items-center justify-center py-4">
                    {uploading ? (
                      <>
                        <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-2" />
                        <p className="text-sm text-blue-400">در حال آپلود...</p>
                      </>
                    ) : (
                      <>
                        <Image className="w-10 h-10 text-gray-400 mb-2" />
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

            {/* عنوان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                عنوان *
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
                value={formData.subtitle || ""}
                onChange={handleChange}
                placeholder="زیرعنوان (اختیاری)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* heroTagline */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تگ بالای اسلاید (Hero Tagline)
              </label>
              <input
                type="text"
                name="heroTagline"
                value={formData.heroTagline || ""}
                onChange={handleChange}
                placeholder="مثال: مرکز توسعه فناوری‌های برتر تهران"
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
                value={formData.description || ""}
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
                  value={formData.buttonText || ""}
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
                  value={formData.buttonLink || ""}
                  onChange={handleChange}
                  placeholder="/services یا https://..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* رنگ و ترتیب */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  رنگ گرادیانت
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="color"
                    value={formData.color || "#3b82f6"}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-xl border border-white/20 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color || "#3b82f6"}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                    placeholder="#3b82f6"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  کد رنگ برای گرادیانت متن در اسلاید
                </p>
              </div>
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
            </div>

            {/* فعال */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                />
                <span>فعال</span>
              </label>
              <span className="text-xs text-gray-500">
                اسلایدهای غیرفعال در صفحه اصلی نمایش داده نمی‌شوند
              </span>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4">
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
                loading={submitting || uploading}
                icon={<Save className="w-5 h-5" />}
                iconPosition="left"
                disabled={submitting || uploading}
              >
                {uploading ? "در حال آپلود..." : "ذخیره تغییرات"}
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
