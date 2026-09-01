// src/components/admin/Tickets/TicketCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketsAPI } from "../../../lib/api/tickets";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import {
  ArrowLeft,
  Save,
  Ticket,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function TicketCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // ✅ حتماً string باشه
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "", // ✅ تغییر به message
    department: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ اعتبارسنجی
    if (!formData.title.trim()) {
      toast.error("❌ عنوان تیکت الزامی است");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("❌ متن پیام الزامی است");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("📤 ارسال داده:", {
        title: formData.title,
        message: formData.message,
        department: formData.department || undefined,
        priority: formData.priority,
      });

      await ticketsAPI.create({
        title: formData.title,
        message: formData.message,
        department: formData.department || undefined,
        priority: formData.priority,
      });

      setSuccess(true);
      toast.success("✅ تیکت با موفقیت ایجاد شد");

      setTimeout(() => {
        navigate("/admin/tickets");
      }, 1500);
    } catch (err: any) {
      console.error("❌ خطا در ایجاد تیکت:", err);

      // ✅ تبدیل خطا به رشته
      let errorMessage = "خطا در ایجاد تیکت";

      if (err.response?.status === 422) {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          // ✅ استخراج پیام‌ها از آرایه
          errorMessage = detail.map((d: any) => d.msg || d).join(", ");
        } else if (typeof detail === "string") {
          errorMessage = detail;
        } else if (detail && typeof detail === "object") {
          // ✅ اگر شیء بود، به رشته تبدیل کن
          errorMessage = Object.values(detail).flat().join(", ");
        }
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage); // ✅ همیشه string
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* هدر */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/tickets")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-6 h-6 text-blue-400" />
              ایجاد تیکت جدید
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              برای دریافت پشتیبانی، تیکت جدید ایجاد کنید
            </p>
          </div>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="20px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {/* ✅ نمایش خطا به صورت امن */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>✅ تیکت با موفقیت ایجاد شد!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* عنوان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                عنوان تیکت <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="مثال: مشکل در ورود به سیستم"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading}
                minLength={3}
                maxLength={100}
              />
            </div>

            {/* دپارتمان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                دپارتمان
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <option value="">انتخاب دپارتمان...</option>
                <option value="technical">🛠️ فنی</option>
                <option value="support">💬 پشتیبانی</option>
                <option value="sales">💰 فروش</option>
                <option value="general">📋 عمومی</option>
              </select>
            </div>

            {/* پیام - با name="message" */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                متن پیام <span className="text-red-400">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                placeholder="توضیحات کامل مشکل خود را وارد کنید..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading}
                minLength={10}
                maxLength={2000}
              />
            </div>

            {/* اولویت */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                اولویت
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <option value="LOW">🟢 کم</option>
                <option value="MEDIUM">🟡 متوسط</option>
                <option value="HIGH">🟠 بالا</option>
                <option value="URGENT">🔴 فوری</option>
                <option value="CRITICAL">🔥 بحرانی</option>
              </select>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <GlassButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate("/admin/tickets")}
                className="flex-1"
                disabled={loading}
              >
                انصراف
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                icon={<Save className="w-5 h-5" />}
                iconPosition="left"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {loading ? "در حال ایجاد..." : "ایجاد تیکت"}
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
