// src/pages/TicketCreate.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ticketsAPI } from "../lib/api/tickets";
import { employeesAPI } from "../lib/api/employees";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";
import { ArrowLeft, Save, Ticket, User, Briefcase } from "lucide-react";

export default function TicketCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    employeeId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  // 🔥 دریافت اطلاعات کاربر جاری
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await employeesAPI.getAll();
      setEmployees(data || []);
    } catch (err) {
      console.error("خطا در دریافت کارمندان:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔥 userId = کاربر جاری، employeeId = کارمند انتخاب شده
      await ticketsAPI.create({
        userId: user?.id,
        employeeId: formData.employeeId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      });
      alert("✅ تیکت با موفقیت ایجاد شد!");
      navigate("/profile");
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در ایجاد تیکت");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-400" />
            ایجاد تیکت جدید
          </h1>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="20px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <p className="text-gray-400 text-sm mb-4">
            تیکت خود را ثبت کنید تا تیم پشتیبانی در اسرع وقت به آن رسیدگی کند.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* انتخاب کارمند */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Briefcase className="inline w-4 h-4 mr-1" />
                کارمند پاسخ‌دهنده
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                required
                disabled={loadingEmployees}
              >
                <option value="">انتخاب کارمند...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.position || "کارمند"} ({emp.phone})
                  </option>
                ))}
              </select>
              {loadingEmployees && (
                <p className="text-xs text-gray-500 mt-1">
                  در حال بارگذاری کارمندان...
                </p>
              )}
            </div>

            {/* عنوان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                عنوان تیکت
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="عنوان تیکت را وارد کنید"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
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
                rows={4}
                placeholder="توضیحات کامل تیکت را وارد کنید..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                required
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="LOW">کم</option>
                <option value="MEDIUM">متوسط</option>
                <option value="HIGH">بالا</option>
                <option value="URGENT">فوری</option>
              </select>
            </div>

            {/* نمایش کاربر جاری */}
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                ارسال‌کننده:{" "}
                <span className="text-white">{user?.name || "کاربر"}</span>
              </p>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4">
              <GlassButton
                type="button"
                variant="white"
                size="md"
                onClick={() => navigate("/profile")}
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
