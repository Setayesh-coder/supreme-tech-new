// src/pages/admin/events/EventEdit.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { eventsAPI } from "../../../lib/api/events";
import { uploadAPI } from "../../../lib/api/upload";
import { ArrowLeft, Save, X, Upload, Loader2 } from "lucide-react";
import { PersianDatePicker } from "../../../components/ui/PersianDatePicker";

export default function EventEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    isActive: true,
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await eventsAPI.getById(id);
        console.log("📥 داده دریافت شد:", response);

        const data = response.data || response;

        setFormData({
          title: data.title || "",
          description: data.description || "",
          content: data.content || "",
          date: data.date ? new Date(data.date).toISOString().slice(0, 16) : "",
          duration: data.duration || "",
          capacity: data.capacity?.toString() || "",
          price: data.price?.toString() || "0", // ✅ اگر null/undefined بود "0"
          location: data.location || "",
          type: data.type || "WORKSHOP",
          featured: data.featured || false,
          isActive: data.isActive !== undefined ? data.isActive : true,
        });
        if (data.image) {
          setCurrentImage(data.image);
          setImagePreview(data.image);
        }
      } catch (err: any) {
        console.error("❌ خطا:", err);
        setError(err.response?.data?.error || "خطا در دریافت اطلاعات رویداد");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

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
    if (error) setError("");
    if (success) setSuccess("");
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
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(currentImage || "");
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
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = currentImage;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      if (!formData.date) {
        setError("لطفاً تاریخ رویداد را انتخاب کنید");
        setSubmitting(false);
        return;
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
        isActive: formData.isActive,
        image: imageUrl,
      };

      console.log("📤 ارسال داده برای ویرایش:", eventData);

      await eventsAPI.update(id!, eventData);
      setSuccess("رویداد با موفقیت ویرایش شد!");

      setTimeout(() => {
        navigate("/admin/events");
      }, 1500);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.error || "خطا در ویرایش رویداد");
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
            onClick={() => navigate("/admin/events")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">✏️ ویرایش رویداد</h1>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="16px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4">
              ✅ {success}
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

            {/* اطلاعات پایه */}
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

            {/* تاریخ و مکان */}
            <div className="grid md:grid-cols-2 gap-4">
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

            {/* ظرفیت و قیمت */}
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
            <div className="flex flex-wrap items-center gap-4">
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
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                />
                فعال
              </label>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4">
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
