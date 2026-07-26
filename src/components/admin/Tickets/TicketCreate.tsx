// src/components/admin/Tickets/TicketCreate.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { ticketsAPI } from "../../../lib/api/tickets";
import { usersAPI } from "../../../lib/api/users";
import { ArrowLeft, Save, User, Ticket } from "lucide-react";

export default function TicketCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  // 🔥 تشخیص نوع کاربر
  const userStr = localStorage.getItem("user");
  const adminStr = localStorage.getItem("admin");
  const employeeStr = localStorage.getItem("employee");

  const user = userStr
    ? JSON.parse(userStr)
    : adminStr
      ? JSON.parse(adminStr)
      : employeeStr
        ? JSON.parse(employeeStr)
        : null;
  const isAdmin =
    adminStr !== null || user?.role === "ADMIN" || user?.type === "admin";
  const isEmployee =
    employeeStr !== null ||
    user?.type === "employee" ||
    user?.role === "EMPLOYEE";

  // 🔥 استفاده از ref برای جلوگیری از اجرای مجدد
  const hasSetUserId = useRef(false);

  useEffect(() => {
    // اگر کارمند هست و userId تنظیم نشده
    if (isEmployee && !isAdmin && user?.id && !hasSetUserId.current) {
      setFormData((prev) => ({ ...prev, userId: user.id }));
      hasSetUserId.current = true;
    }

    // فقط ادمین‌ها لیست کاربران رو می‌بینن
    if (isAdmin && users.length === 0) {
      fetchUsers();
    }
  }, [isAdmin, isEmployee, user]); // ✅ وابستگی‌ها

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll({ limit: 100 });
      setUsers(data.users || []);
    } catch (err) {
      console.error("خطا در دریافت کاربران:", err);
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
      await ticketsAPI.create(formData);
      navigate("/admin/tickets");
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در ایجاد تیکت");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/tickets")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
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
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 🔥 انتخاب کاربر - فقط برای ادمین */}
            {isAdmin ? (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  کاربر
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  required
                >
                  <option value="">انتخاب کاربر...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.phone}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  کاربر
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/60">
                  <User size={18} className="text-white/40" />
                  <span>{user?.name || "کاربر جاری"}</span>
                  <span className="text-xs text-white/30">(شما)</span>
                </div>
                {/* 🔥 مخفی برای ارسال userId */}
                <input type="hidden" name="userId" value={formData.userId} />
              </div>
            )}

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

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4">
              <GlassButton
                type="button"
                variant="white"
                size="md"
                onClick={() => navigate("/admin/tickets")}
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
    </AdminLayout>
  );
}
