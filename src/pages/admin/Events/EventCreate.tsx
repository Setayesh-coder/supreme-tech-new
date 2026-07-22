// src/pages/admin/events/EventCreate.tsx
import { useState } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { eventsAPI } from "../../../lib/api/events";
import { uploadAPI } from "../../../lib/api/upload";
import { Upload, X, Calendar, Loader2 } from "lucide-react";

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
  const [uploading, setUploading] = useState(false); // ✅ نگهش داریم
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ========== هندل کردن انتخاب عکس ==========
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

  // ========== حذف عکس انتخاب شده ==========
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview("");
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  // ========== آپلود عکس به سرور ==========
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(formData);
      console.log("✅ پاسخ دریافت شد:", response);

      if (response.success && response.url) {
        // 🔥 مسیر رو کامل ذخیره کنید
        console.log("✅ آدرس عکس:", response.url);
        return response.url; // http://localhost:5001/uploads/events/event-xxx.png
      } else {
        throw new Error(response.error || "خطا در آپلود عکس");
      }
    } catch (error: any) {
      console.error("❌ خطا در آپلود:", error);
      throw new Error("خطا در آپلود عکس");
    } finally {
      setUploading(false);
    }
  };
  // ========== ارسال فرم ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl = "";

      if (image) {
        imageUrl = await uploadImage(image);
      }

      const eventData = {
        ...formData,
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        image: imageUrl,
        date: new Date(formData.date).toISOString(),
      };

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
    } catch (err) {
      setError("خطا در ایجاد رویداد");
      console.error(err);
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
            {/* ========== آپلود عکس ========== */}
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
                <label
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-white/20 border-dashed rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors bg-white/5 hover:bg-white/10 ${
                    uploading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center py-4">
                    {uploading ? ( // ✅ نمایش لودینگ آپلود
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
                    disabled={uploading} // ✅ غیرفعال در زمان آپلود
                  />
                </label>
              )}
            </div>

            {/* ========== اطلاعات پایه ========== */}
            <div className="grid md:grid-cols-2 gap-4">
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
                  placeholder="عنوان رویداد"
                  required
                />
              </div>

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
            </div>

            {/* ========== تاریخ و مکان ========== */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  تاریخ رویداد
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

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
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  ظرفیت
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="تعداد شرکت‌کنندگان"
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="۰ = رایگان"
                  required
                />
              </div>
            </div>

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
                placeholder="آدرس محل برگزاری"
              />
            </div>

            {/* ========== توضیحات ========== */}
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
                placeholder="توضیحات مختصر رویداد"
                required
              />
            </div>

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

            {/* ========== گزینه‌های اضافی ========== */}
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

            {/* ========== دکمه ثبت ========== */}
            <GlassButton
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              loading={loading || uploading} // ✅ نمایش لودینگ هم برای آپلود و هم برای ثبت
              icon={<Calendar className="w-5 h-5" />}
              iconPosition="left"
              disabled={loading || uploading} // ✅ غیرفعال در زمان آپلود یا ثبت
            >
              {uploading ? "در حال آپلود عکس..." : "ایجاد رویداد"}
            </GlassButton>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
