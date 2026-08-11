
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { employeesAPI } from "../../../lib/api/employees";
import type { Employee } from "../../../lib/api/employees";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { ArrowLeft, User, Phone, Mail, Briefcase, Building, Shield } from "lucide-react";
import { AdminLayout } from "../../../components/admin/AdminLayout";

// تایپ پاسخ از API
type ApiResponse<T> = T | { data: T };

export default function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    phone: "",
    email: "",
    role: "EMPLOYEE",
    department: "",
    position: "",
    isActive: true,
  });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setFetching(true);
      const response = (await employeesAPI.getById(id!)) as ApiResponse<Employee>;
      
      // ✅ استخراج داده از پاسخ
      const data: Employee = response && typeof response === 'object' && 'data' in response 
        ? response.data 
        : response as Employee;
      
      setFormData({
        name: data?.name || "",
        phone: data?.phone || "",
        email: data?.email || "",
        role: data?.role || "EMPLOYEE",
        department: data?.department || "",
        position: data?.position || "",
        isActive: data?.isActive !== undefined ? data.isActive : true,
      });
    } catch (err: any) {
      setError("خطا در دریافت اطلاعات کارمند");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await employeesAPI.update(id!, formData);
      navigate("/admin/employees");
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.error || "خطا در بروزرسانی کارمند");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">در حال بارگذاری...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
          <h1 className="text-2xl font-bold text-white mb-6">ویرایش کارمند</h1>

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

              <div>
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

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive !== false}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                  />
                  فعال بودن
                </label>
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
                {loading ? "در حال بروزرسانی..." : "بروزرسانی کارمند"}
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
