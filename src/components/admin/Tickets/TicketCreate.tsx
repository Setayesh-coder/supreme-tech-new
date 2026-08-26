// src/components/admin/Tickets/TicketCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketsAPI } from "../../../lib/api/tickets";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { ArrowLeft, Save, Ticket, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "../../../hooks/use-toast";

export default function TicketCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "", // ✅ تغییر از message به description
    department: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ اعتبارسنجی
    if (!formData.title.trim()) {
      toast.error("❌ عنوان تیکت الزامی است");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("❌ متن پیام الزامی است");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await ticketsAPI.create({
        title: formData.title,
        description: formData.description, // ✅ ارسال description
        department: formData.department || undefined,
        priority: formData.priority,
      });

      setSuccess("✅ تیکت با موفقیت ایجاد شد!");
      toast.success("✅ تیکت با موفقیت ایجاد شد");
      
      setTimeout(() => {
        navigate("/admin/tickets");
      }, 1500);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      const errorMsg = err.response?.data?.detail || "خطا در ایجاد تیکت";
      setError(errorMsg);
      toast.error(errorMsg);
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
          {/* خطا */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* موفقیت */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                عنوانی کوتاه و گویا برای تیکت خود وارد کنید
              </p>
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                disabled={loading}
              >
                <option value="">انتخاب دپارتمان...</option>
                <option value="technical">🛠️ فنی</option>
                <option value="support">💬 پشتیبانی</option>
                <option value="sales">💰 فروش</option>
                <option value="general">📋 عمومی</option>
              </select>
            </div>

            {/* پیام */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                متن پیام <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="توضیحات کامل مشکل خود را وارد کنید..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                توضیحات کامل و دقیق را وارد کنید تا تیم پشتیبانی بهتر بتواند کمک کند
              </p>
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                disabled={loading}
              >
                <option value="LOW">🟢 کم</option>
                <option value="MEDIUM">🟡 متوسط</option>
                <option value="HIGH">🟠 بالا</option>
                <option value="URGENT">🔴 فوری</option>
                <option value="CRITICAL">🔥 بحرانی</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                در صورت فوری بودن مشکل، اولویت را بالا انتخاب کنید
              </p>
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