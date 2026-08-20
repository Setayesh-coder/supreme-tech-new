// src/components/course/CoursePreRegisterModal.tsx
import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, GraduationCap } from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import {
  enrollmentsAPI,
  type CoursePreRegisterData,
} from "../../lib/api/enrollments";

interface CoursePreRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  course_id: string;
  courseTitle: string;
  onSuccess?: () => void;
}

export default function CoursePreRegisterModal({
  isOpen,
  onClose,
  course_id,
  courseTitle,
  onSuccess,
}: CoursePreRegisterModalProps) {
  const [formData, setFormData] = useState<CoursePreRegisterData>({
    course_id: "",
    field_of_study: "",
    university: "",
    has_experience: false,
    experience_level: "",
    has_laptop: false,
    os_type: "",
    goal: "",
    referral_source: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [, setStep] = useState(1);

  // 🔄 Reset فرم وقتی بسته می‌شود
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        course_id: course_id,
        field_of_study: "",
        university: "",
        has_experience: false,
        experience_level: "",
        has_laptop: false,
        os_type: "",
        goal: "",
        referral_source: "",
      });
      setError("");
      setSuccess(false);
      setStep(1);
    }
  }, [isOpen, course_id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ فقط به بک‌اند ارسال کن - بدون localStorage
      const response = await enrollmentsAPI.preRegister({
        course_id: course_id,
        field_of_study: formData.field_of_study?.trim() || "",
        university: formData.university?.trim() || "",
        has_experience: formData.has_experience || false,
        experience_level: formData.experience_level || "",
        has_laptop: formData.has_laptop || false,
        os_type: formData.os_type || "",
        goal: formData.goal?.trim() || "",
        referral_source: formData.referral_source?.trim() || "",
      });

      console.log("✅ پاسخ سرور:", response);

      // ✅ موفقیت - فقط notify می‌کنیم
      setSuccess(true);

      // ✅ تابع onSuccess را صدا می‌زنیم تا والد (مثلاً Profile) داده‌ها را از بک‌اند دوباره دریافت کند
      if (onSuccess) {
        onSuccess();
      }

      // بستن مودال بعد از 2 ثانیه
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("❌ خطا:", err);

      // نمایش پیام خطای مناسب
      if (err.response?.status === 401) {
        setError("❌ نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 2000);
      } else if (err.response?.status === 409) {
        setError("❌ شما قبلاً در این دوره ثبت‌نام کرده‌اید");
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "خطا در ثبت اطلاعات",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <LiquidGlassCard
          className="p-6 md:p-8 relative"
          borderRadius="24px"
          blurIntensity="xl"
          glowIntensity="lg"
          shadowIntensity="lg"
        >
          {/* دکمه بستن */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* هدر */}
          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <GraduationCap className="w-6 h-6" />
              <span>پیش‌ثبت‌نام در دوره</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">{courseTitle}</p>
          </div>

          {/* وضعیت موفقیت */}
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white">✅ ثبت شد!</h3>
              <p className="text-gray-400 text-sm mt-1">
                اطلاعات شما با موفقیت در سرور ثبت شد.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                دوره به سبد خرید شما اضافه شد.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ===== رشته تحصیلی ===== */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  رشته تحصیلی
                </label>
                <input
                  type="text"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="مثلاً: مهندسی کامپیوتر"
                />
              </div>

              {/* ===== دانشگاه ===== */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  دانشگاه / موسسه
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="نام دانشگاه یا موسسه"
                />
              </div>

              {/* ===== تجربه کاری ===== */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="has_experience"
                  checked={formData.has_experience}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                  id="has_experience"
                />
                <label
                  htmlFor="has_experience"
                  className="text-sm text-white/80 cursor-pointer"
                >
                  سابقه کاری در حوزه فناوری دارم
                </label>
              </div>

              {/* ===== سطح تجربه ===== */}
              {formData.has_experience && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    سطح تجربه
                  </label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="مبتدی">مبتدی</option>
                    <option value="متوسط">متوسط</option>
                    <option value="پیشرفته">پیشرفته</option>
                    <option value="حرفه‌ای">حرفه‌ای</option>
                  </select>
                </div>
              )}

              {/* ===== داشتن لپ‌تاپ ===== */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="has_laptop"
                  checked={formData.has_laptop}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                  id="has_laptop"
                />
                <label
                  htmlFor="has_laptop"
                  className="text-sm text-white/80 cursor-pointer"
                >
                  لپ‌تاپ شخصی دارم
                </label>
              </div>

              {/* ===== سیستم عامل ===== */}
              {formData.has_laptop && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    سیستم عامل
                  </label>
                  <select
                    name="os_type"
                    value={formData.os_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="Windows">Windows</option>
                    <option value="macOS">macOS</option>
                    <option value="Linux">Linux</option>
                  </select>
                </div>
              )}

              {/* ===== هدف از ثبت‌نام ===== */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  هدف از ثبت‌نام
                </label>
                <textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="چرا می‌خواهید در این دوره شرکت کنید؟"
                />
              </div>

              {/* ===== منبع آشنایی ===== */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  از کجا با ما آشنا شدید؟
                </label>
                <select
                  name="referral_source"
                  value={formData.referral_source}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="اینستاگرام">اینستاگرام</option>
                  <option value="تلگرام">تلگرام</option>
                  <option value="گوگل">گوگل</option>
                  <option value="دوستان">دوستان</option>
                  <option value="سایر">سایر</option>
                </select>
              </div>

              {/* خطا */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* دکمه‌ها */}
              <div className="flex gap-3 pt-2">
                <GlassButton
                  type="button"
                  variant="white"
                  size="md"
                  onClick={onClose}
                  className="flex-1"
                >
                  انصراف
                </GlassButton>
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "در حال ثبت..." : "ثبت اطلاعات"}
                </GlassButton>
              </div>
            </form>
          )}
        </LiquidGlassCard>
      </div>
    </div>
  );
}
