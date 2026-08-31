// src/pages/admin/events/EventCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { eventsAPI, generateSlug } from "../../../lib/api/events";
import { uploadAPI } from "../../../lib/api/upload";
import { PersianDatePicker } from "../../../components/ui/PersianDatePicker";
import { Upload, X, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "../../../hooks/use-toast";

export default function EventCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    start_date: "",
    end_date: "",
    duration: "",
    capacity: "",
    price: "",
    location: "",
    category: "WORKSHOP", // ✅ تغییر از type به category
    is_featured: false, // ✅ تغییر از featured به is_featured
    is_active: true, // ✅ اضافه شد
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
    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(file, "events");
      // console.log("✅ تصویر آپلود شد:", response.url);
      return response.url;
    } catch (error: any) {
      console.error("❌ خطا در آپلود:", error);
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map((e: any) => e.msg).join(", "));
      }
      throw new Error(detail || "خطا در آپلود عکس");
    } finally {
      setUploading(false);
    }
  };

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
      // ✅ آپلود تصویر
      let imageUrl = "";
      if (image) {
        try {
          imageUrl = await uploadImage(image);
        } catch (uploadError: any) {
          setError(uploadError.message || "خطا در آپلود تصویر");
          setLoading(false);
          return;
        }
      }

      const capacity = safeNumber(formData.capacity);
      const price = safeNumber(formData.price);
      const slug = generateSlug(formData.title.trim()) || "بدون-عنوان";

      const eventData = {
        title: formData.title.trim(),
        // slug: generateSlug(formData.title.trim()),
        slug: slug,
        description: formData.description.trim(),
        content: formData.content?.trim() || "",
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration: formData.duration?.trim() || "",
        capacity: capacity,
        price: price,
        location: formData.location?.trim() || "",
        category: formData.category, // ✅ تغییر از type
        is_active: formData.is_active, // ✅ اضافه شد
        is_featured: formData.is_featured, // ✅ تغییر از featured
        cover_image: imageUrl || "", // ✅ تغییر از image
      };

      // console.log("📤 ارسال داده:", eventData);

      await eventsAPI.create(eventData);
      toast.success(" رویداد با موفقیت ایجاد شد!");
      navigate("/admin/events");
    } catch (err: any) {
      toast.error(" خطا:", err);

      let errorMessage = "خطا در ایجاد رویداد";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => e.msg).join(", ");
        } else {
          errorMessage = detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/events")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">ایجاد رویداد جدید</h1>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="16px"
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
                عنوان رویداد <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚡ اسلاگ به صورت خودکار از عنوان تولید می‌شود
              </p>
            </div>

            {/* تاریخ */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تاریخ شروع رویداد <span className="text-red-400">*</span>
              </label>
              <PersianDatePicker
                value={formData.start_date}
                onChange={(start_date) =>
                  setFormData({ ...formData, start_date })
                }
                placeholder="انتخاب تاریخ و زمان"
                includeTime={true}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تاریخ پایان رویداد <span className="text-red-400">*</span>
              </label>
              <PersianDatePicker
                value={formData.end_date}
                onChange={(end_date) => setFormData({ ...formData, end_date })}
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
                دسته‌بندی رویداد
              </label>
              <select
                name="category"
                value={formData.category}
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
              {/* <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  ظرفیت <span className="text-red-400">*</span>
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
              </div> */}
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
                توضیحات کوتاه <span className="text-red-400">*</span>
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
                placeholder="محتوای کامل رویداد (اختیاری)"
              />
            </div>

            {/* گزینه‌ها */}
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                />
                رویداد ویژه
              </label>
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                />
                فعال
              </label>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <GlassButton
                type="button"
                variant="white"
                size="md"
                onClick={() => navigate("/admin/events")}
              >
                انصراف
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="md"
                loading={loading || uploading}
                disabled={loading || uploading}
                className="flex-1"
              >
                {uploading
                  ? "در حال آپلود..."
                  : loading
                    ? "در حال ایجاد..."
                    : "ایجاد رویداد"}
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
