// src/pages/admin/Employees/EmployeeCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeesAPI } from "../../../lib/api/employees";
import type { Employee } from "../../../lib/api/employees";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { ArrowLeft, User, Phone, Mail, Lock, Briefcase, Building, Shield } from "lucide-react";
import { AdminLayout } from "../../../components/admin/AdminLayout";

export default function EmployeeCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Employee> & { password?: string }>({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    department: "",
    position: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { password, ...dataToSend } = formData;
      await employeesAPI.create(dataToSend);
      navigate("/admin/employees");
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.error || "خطا در ایجاد کارمند");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/admin/employees")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          بازگشت به لیست کارمندان
        </button>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <h1 className="text-2xl font-bold text-white mb-6">ایجاد کارمند جدید</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">نام کامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">شماره تلفن</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">ایمیل</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">رمز عبور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">نقش</label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    name="role"
                    value={formData.role || "EMPLOYEE"}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option value="EMPLOYEE">کارمند</option>
                    <option value="MANAGER">مدیر</option>
                    <option value="ADMIN">ادمین</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">بخش</label>
                <div className="relative">
                  <Building className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department || ""}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">سمت</label>
                <div className="relative">
                  <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="position"
                    value={formData.position || ""}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? "در حال ایجاد..." : "ایجاد کارمند"}
              </GlassButton>
              <GlassButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate("/admin/employees")}
              >
                انصراف
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
