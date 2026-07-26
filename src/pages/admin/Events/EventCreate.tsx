// src/pages/admin/events/EventCreate.tsx
import { useState } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { eventsAPI } from "../../../lib/api/events";
import { uploadAPI } from "../../../lib/api/upload";
import { PersianDatePicker } from "../../../components/ui/PersianDatePicker";
import { Upload, X, Loader2 } from "lucide-react";

export default function EventCreate() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    date: "",
    duration: "",
    capacity: "",
    price: "",
    location: "",
    type: "WORKSHOP",
    featured: false,
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview("");
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(formData);
      return response.url;
    } catch (error) {
      throw new Error("خطا در آپلود عکس");
    } finally {
      setUploading(false);
    }
  };

  // 🔥 تابع ایمن برای تبدیل به عدد
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : Math.max(0, num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImage(image);
      }

      // 🔥 تبدیل ایمن به عدد
      const capacity = safeNumber(formData.capacity);
      const price = safeNumber(formData.price);

      const eventData = {
        title: formData.title,
        description: formData.description,
        content: formData.content || "",
        date: new Date(formData.date).toISOString(),
        duration: formData.duration,
        capacity: capacity,
        price: price, // ✅ حتماً 0 یا بیشتر
        location: formData.location,
        type: formData.type,
        featured: formData.featured,
        image: imageUrl,
      };

      console.log("📤 ارسال داده:", eventData);

      await eventsAPI.create(eventData);

      alert("رویداد با موفقیت ایجاد شد!");

      setFormData({
        title: "",
        description: "",
        content: "",
        date: "",
        duration: "",
        capacity: "",
        price: "",
        location: "",
        type: "WORKSHOP",
        featured: false,
      });
      handleRemoveImage();
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.error || "خطا در ایجاد رویداد");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="16px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <h1 className="text-2xl font-bold text-white mb-6">
            ایجاد رویداد جدید
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* تصویر */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تصویر رویداد
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="پیش‌نمایش"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
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

            {/* عنوان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                عنوان رویداد
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* تاریخ با PersianDatePicker */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تاریخ رویداد
              </label>
              <PersianDatePicker
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                placeholder="انتخاب تاریخ و زمان"
                includeTime={true}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* مدت زمان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                مدت زمان
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="مثلاً: ۲ ساعت"
              />
            </div>

            {/* نوع رویداد */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                نوع رویداد
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="WORKSHOP">کارگاه</option>
                <option value="COURSE">دوره</option>
                <option value="WEBINAR">وبینار</option>
                <option value="CONFERENCE">کنفرانس</option>
                <option value="MEETUP">دیدار</option>
                <option value="BOOTCAMP">بوت‌کمپ</option>
              </select>
            </div>

            {/* ظرفیت و قیمت */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  ظرفیت
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  قیمت (تومان)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* مکان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                مکان برگزاری
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* توضیحات */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                توضیحات کوتاه
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>

            {/* محتوای کامل */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                محتوای کامل
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* گزینه‌ها */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                />
                رویداد ویژه
              </label>
            </div>

            {/* دکمه ثبت */}
            <GlassButton
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              loading={loading || uploading}
              disabled={loading || uploading}
            >
              {uploading ? "در حال آپلود عکس..." : "ایجاد رویداد"}
            </GlassButton>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
