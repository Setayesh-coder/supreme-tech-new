import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { coursesAPI } from "../../../lib/api/courses";
import { eventsAPI } from "../../../lib/api/events";
import { uploadAPI } from "../../../lib/api/upload";
import { ArrowLeft, Save, Upload, Loader2, X } from "lucide-react";

interface Event {
  id: string;
  title: string;
}

export default function CourseCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    price: "",
    duration: "",
    level: "",
    capacity: "",
    eventId: "",
    startDate: "",
    endDate: "",
    isFeatured: false,
    order: 0,
    status: "DRAFT",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsAPI.getAll();
      setEvents(data.events || data || []);
    } catch (err) {
      console.error("❌ خطا در دریافت ایونت‌ها:", err);
    }
  };

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
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploading(true);
      const response = await uploadAPI.uploadImageWithFormData(formData);
      return response.url;
    } catch (error) {
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
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        content: formData.content || "",
        price: parseFloat(formData.price) || 0,
        duration: formData.duration,
        level: formData.level,
        capacity: parseInt(formData.capacity) || 0,
        eventId: formData.eventId || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        isFeatured: formData.isFeatured,
        order: parseInt(String(formData.order)) || 0,
        status: formData.status,
        image: imageUrl,
      };

      await coursesAPI.create(courseData);
      setSuccess("✅ دوره با موفقیت ایجاد شد!");

      setTimeout(() => {
        navigate("/admin/courses");
      }, 1500);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.error || "خطا در ایجاد دوره");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/courses")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">➕ دوره جدید</h1>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="16px"
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
            {/* تصویر */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تصویر دوره
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
                      <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-2" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400">برای آپلود کلیک کنید</p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (حداکثر ۵MB)</p>
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
                عنوان دوره *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* محتوا */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                محتوای کامل
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* ایونت مرتبط */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                ایونت مرتبط
              </label>
              <select
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">بدون ایونت</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            {/* مدت زمان و سطح */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  مدت زمان
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="مثلاً: ۴ هفته"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  سطح
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">انتخاب سطح</option>
                  <option value="مبتدی">مبتدی</option>
                  <option value="متوسط">متوسط</option>
                  <option value="پیشرفته">پیشرفته</option>
                </select>
              </div>
            </div>

            {/* قیمت و ظرفیت */}
            <div className="grid md:grid-cols-2 gap-4">
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
                  placeholder="۰ = رایگان"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
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
                  placeholder="۰ = نامحدود"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* تاریخ شروع و پایان */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  تاریخ شروع
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  تاریخ پایان
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* وضعیت و ترتیب */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  وضعیت
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="DRAFT">پیش‌نویس</option>
                  <option value="PUBLISHED">منتشر شده</option>
                </select>
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
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* گزینه‌ها */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                />
                دوره ویژه
              </label>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4">
              <GlassButton
                type="button"
                variant="white"
                size="md"
                onClick={() => navigate("/admin/courses")}
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
                {uploading ? "در حال آپلود..." : "ایجاد دوره"}
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
