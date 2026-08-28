// src/pages/admin/Courses/CourseEdit.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { coursesAPI } from "../../../lib/api/courses";
import { eventsAPI } from "../../../lib/api/events";
import { uploadAPI } from "../../../lib/api/upload";
import { PersianDatePicker } from "../../../components/ui/PersianDatePicker";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
  Calendar,
  User,
  Clock,
  DollarSign,
  Percent,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
}

export default function CourseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [originalSlug, setOriginalSlug] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor_name: "",
    price: 0,
    orginal_price: 0,
    discount_value: 0,
    discount_type: "PERCENT" as "PERCENT" | "FIXED",
    duration_hours: 0,
    is_active: true,
    event_id: "",
    registration_start_date: "",
    registration_end_date: "",
    class_start_date: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [, setCurrentImage] = useState<string>("");
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const data = await eventsAPI.getAll({ size: 100, is_active: true });
        setEvents(data.items || []);
      } catch (err) {
        console.error("❌ خطا در دریافت رویدادها:", err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await coursesAPI.getById(id);

        setOriginalSlug(data.slug || "");

        setFormData({
          title: data.title || "",
          description: data.description || "",
          instructor_name: data.instructor_name || "",
          price: data.price || 0,
          orginal_price: data.orginal_price || 0,
          discount_value: data.discount_value || 0,
          discount_type:
            (data.discount_type as "PERCENT" | "FIXED") || "PERCENT",
          duration_hours: data.duration_hours || 0,
          is_active: data.is_active !== undefined ? data.is_active : true,
          event_id: data.event_id || "",
          registration_start_date: data.registration_start_date || "",
          registration_end_date: data.registration_end_date || "",
          class_start_date: data.class_start_date || "",
        });

        if (data.cover_image) {
          setCurrentImage(data.cover_image);
          setImagePreview(data.cover_image);
          setIsImageRemoved(false);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || "خطا در دریافت اطلاعات دوره");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
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
      setIsImageRemoved(false);
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview("");
    setCurrentImage("");
    setIsImageRemoved(true);
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(file, "courses");
      return response.url;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "خطا در آپلود تصویر");
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
      let imageUrl: string | undefined = undefined;

      if (image) {
        try {
          imageUrl = await uploadImage(image);
        } catch (uploadError: any) {
          setError(uploadError.message);
          setSubmitting(false);
          return;
        }
      }

      if (isImageRemoved) {
        imageUrl = null as any;
      }

      const courseData = {
        title: formData.title.trim(),
        slug: originalSlug,
        description: formData.description?.trim() || undefined,
        cover_image: imageUrl,
        price: Number(formData.price) || 0,
        orginal_price: Number(formData.orginal_price) || 0,
        discount_value: Number(formData.discount_value) || 0,
        discount_type: formData.discount_type,
        duration_hours: Number(formData.duration_hours) || undefined,
        instructor_name: formData.instructor_name?.trim() || undefined,
        is_active: formData.is_active,
        event_id: formData.event_id || undefined,
        registration_start_date: formData.registration_start_date,
        registration_end_date: formData.registration_end_date,
        class_start_date: formData.class_start_date,
      };

      await coursesAPI.update(id!, courseData);
      setSuccess("✅ دوره با موفقیت ویرایش شد!");
      setIsImageRemoved(false);

      setTimeout(() => {
        navigate("/admin/courses");
      }, 1500);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(
        err.response?.data?.detail || err.message || "خطا در ویرایش دوره",
      );
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
            onClick={() => navigate("/admin/courses")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">✏️ ویرایش دوره</h1>
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
                تصویر کاور
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
                  <p className="text-xs text-gray-400 mt-1">
                    {isImageRemoved
                      ? "🗑️ تصویر حذف خواهد شد"
                      : image
                        ? "🆕 تصویر جدید"
                        : "📸 تصویر فعلی"}
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
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400">
                          {isImageRemoved
                            ? "تصویر حذف شد - برای آپلود کلیک کنید"
                            : "برای آپلود کلیک کنید"}
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
                عنوان <span className="text-red-400">*</span>
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
                ⚡ اسلاگ دوره هنگام ویرایش تغییر نمی‌کند
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="توضیحات کامل دوره را وارد کنید..."
              />
            </div>

            {/* مدرس */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                نام مدرس
              </label>
              <input
                type="text"
                name="instructor_name"
                value={formData.instructor_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="نام مدرس را وارد کنید"
              />
            </div>

            {/* قیمت و تخفیف */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  قیمت اصلی (تومان)
                </label>
                <input
                  type="number"
                  name="orginal_price"
                  value={formData.orginal_price}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  قیمت نهایی (تومان)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  قیمت نهایی = قیمت اصلی - تخفیف
                </p>
              </div>
            </div>

            {/* تخفیف */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-orange-400" />
                  مقدار تخفیف
                </label>
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="مقدار تخفیف"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  نوع تخفیف
                </label>
                <select
                  name="discount_type"
                  value={formData.discount_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="PERCENT">درصدی (%)</option>
                  <option value="FIXED">مبلغ ثابت (تومان)</option>
                </select>
              </div>
            </div>

            {/* مدت زمان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                مدت زمان (ساعت)
              </label>
              <input
                type="number"
                name="duration_hours"
                value={formData.duration_hours}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* ✅ تاریخ‌ها با PersianDatePicker */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  شروع ثبت‌نام
                </label>
                <PersianDatePicker
                  value={formData.registration_start_date}
                  onChange={(date) =>
                    setFormData({ ...formData, registration_start_date: date })
                  }
                  includeTime
                  placeholder="انتخاب تاریخ و ساعت"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  پایان ثبت‌نام
                </label>
                <PersianDatePicker
                  value={formData.registration_end_date}
                  onChange={(date) =>
                    setFormData({ ...formData, registration_end_date: date })
                  }
                  includeTime
                  placeholder="انتخاب تاریخ و ساعت"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                تاریخ شروع کلاس
              </label>
              <PersianDatePicker
                value={formData.class_start_date}
                onChange={(date) =>
                  setFormData({ ...formData, class_start_date: date })
                }
                includeTime
                placeholder="انتخاب تاریخ و ساعت"
                className="w-full"
              />
            </div>

            {/* رویداد مرتبط */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                رویداد مرتبط
              </label>
              <select
                name="event_id"
                value={formData.event_id}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">بدون رویداد</option>
                {eventsLoading ? (
                  <option value="" disabled>
                    در حال بارگذاری...
                  </option>
                ) : (
                  events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* وضعیت */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-500"
                id="is_active"
              />
              <label
                htmlFor="is_active"
                className="text-sm text-white/80 cursor-pointer"
              >
                دوره فعال باشد
              </label>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
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
                className="flex-1"
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
