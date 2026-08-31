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

// ✅ لیست فیلدهای اجباری
const REQUIRED_FIELDS: (keyof CoursePreRegisterData)[] = [
  "field_of_study",
  "university",
  "goal",
  "referral_source",
];

// ✅ لیست فیلدهای شرطی اجباری
const CONDITIONAL_REQUIRED_FIELDS: {
  condition: (data: CoursePreRegisterData) => boolean;
  fields: (keyof CoursePreRegisterData)[];
}[] = [
  {
    condition: (data) => data.has_experience === true,
    fields: ["experience_level"],
  },
  {
    condition: (data) => data.has_laptop === true,
    fields: ["os_type"],
  },
];

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
  const [errors, setErrors] = useState<
    Partial<Record<keyof CoursePreRegisterData, string>>
  >({});
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
      setErrors({});
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

    // ✅ پاک کردن خطای مربوط به این فیلد
    if (errors[name as keyof CoursePreRegisterData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  }

  // ✅ تابع اعتبارسنجی
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CoursePreRegisterData, string>> = {};
    let isValid = true;

    // ✅ بررسی فیلدهای اجباری عمومی
    for (const field of REQUIRED_FIELDS) {
      const value = formData[field];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        newErrors[field] = "این فیلد اجباری است";
        isValid = false;
      }
    }

    // ✅ بررسی فیلدهای شرطی اجباری
    for (const { condition, fields } of CONDITIONAL_REQUIRED_FIELDS) {
      if (condition(formData)) {
        for (const field of fields) {
          const value = formData[field];
          if (!value || (typeof value === "string" && value.trim() === "")) {
            newErrors[field] = "این فیلد اجباری است";
            isValid = false;
          }
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // ✅ بررسی آیا فیلد خطا دارد
  const hasError = (field: keyof CoursePreRegisterData): boolean => {
    return !!errors[field];
  };

  // ✅ دریافت پیام خطا
  const getError = (field: keyof CoursePreRegisterData): string | undefined => {
    return errors[field];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ اعتبارسنجی فرم
    if (!validateForm()) {
      // اسکرول به اولین خطا
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          (element as HTMLElement).focus();
        }
      }
      return;
    }

    setLoading(true);
    setError("");

    try {
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

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      }
      console.log("✅ پاسخ سرور:", response);

      setSuccess(true);

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("❌ خطا:", err);

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

  // ✅ کلاس خطا برای input
  const errorInputClass = (field: keyof CoursePreRegisterData) => {
    return hasError(field)
      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
      : "border-white/20 focus:border-blue-500";
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
              {/* ===== رشته تحصیلی (اجباری) ===== */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  رشته تحصیلی <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none transition-colors ${errorInputClass("field_of_study")}`}
                  placeholder="مثلاً: مهندسی کامپیوتر"
                />
                {hasError("field_of_study") && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getError("field_of_study")}
                  </p>
                )}
              </div>

              {/* ===== دانشگاه (اجباری) ===== */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  دانشگاه / موسسه <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none transition-colors ${errorInputClass("university")}`}
                  placeholder="نام دانشگاه یا موسسه"
                />
                {hasError("university") && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getError("university")}
                  </p>
                )}
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

              {/* ===== سطح تجربه (شرطی اجباری) ===== */}
              {formData.has_experience && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    سطح تجربه <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white focus:outline-none transition-colors ${errorInputClass("experience_level")}`}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="مبتدی">مبتدی</option>
                    <option value="متوسط">متوسط</option>
                    <option value="پیشرفته">پیشرفته</option>
                    <option value="حرفه‌ای">حرفه‌ای</option>
                  </select>
                  {hasError("experience_level") && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {getError("experience_level")}
                    </p>
                  )}
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

              {/* ===== سیستم عامل (شرطی اجباری) ===== */}
              {formData.has_laptop && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    سیستم عامل <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="os_type"
                    value={formData.os_type}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white focus:outline-none transition-colors ${errorInputClass("os_type")}`}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="Windows">Windows</option>
                    <option value="macOS">macOS</option>
                    <option value="Linux">Linux</option>
                  </select>
                  {hasError("os_type") && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {getError("os_type")}
                    </p>
                  )}
                </div>
              )}

              {/* ===== هدف از ثبت‌نام (اجباری) ===== */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  هدف از ثبت‌نام <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none transition-colors resize-none ${errorInputClass("goal")}`}
                  placeholder="چرا می‌خواهید در این دوره شرکت کنید؟"
                />
                {hasError("goal") && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getError("goal")}
                  </p>
                )}
              </div>

              {/* ===== منبع آشنایی (اجباری) ===== */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  از کجا با ما آشنا شدید؟{" "}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  name="referral_source"
                  value={formData.referral_source}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white focus:outline-none transition-colors ${errorInputClass("referral_source")}`}
                >
                  <option value="">انتخاب کنید</option>
                  <option value="اینستاگرام">اینستاگرام</option>
                  <option value="تلگرام">تلگرام</option>
                  <option value="گوگل">گوگل</option>
                  <option value="دوستان">دوستان</option>
                  <option value="سایر">سایر</option>
                </select>
                {hasError("referral_source") && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getError("referral_source")}
                  </p>
                )}
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
