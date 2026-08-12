// src/pages/admin/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { authAPI } from "../../lib/api/auth";
import {
  User,
  Phone,
  Mail,
  Edit2,
  Save,
  X,
  LogOut,
  Shield,
  Calendar,
} from "lucide-react";

interface AdminProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  createdAt: string;
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
          const parsed = JSON.parse(storedAdmin);
          setAdmin(parsed);
          setFormData({
            name: parsed.name || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
          });
          setLoading(false);
          return;
        }

        // اگر در localStorage نبود، از API بگیر
        const data = await authAPI.getProfile();
        setAdmin(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        console.error("❌ خطا:", err);
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleEdit = () => {
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditing(false);
    if (admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
      });
    }
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await authAPI.updateProfile(formData);
      setAdmin(updated);
      localStorage.setItem("admin", JSON.stringify(updated));
      setSuccess("اطلاعات با موفقیت بروزرسانی شد");
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در بروزرسانی");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("رمز عبور جدید و تکرار آن مطابقت ندارند");
      return;
    }
    if (passwordData.new_password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess("رمز عبور با موفقیت تغییر کرد");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در تغییر رمز عبور");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!admin) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">اطلاعاتی یافت نشد</p>
        </div>
      </AdminLayout>
    );
  }

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "مدیر ارشد",
    ADMIN: "مدیر",
    EDITOR: "ویرایشگر",
    VIEWER: "ناظر",
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">👤 پروفایل ادمین</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4">
            ✅ {success}
          </div>
        )}

        {/* اطلاعات اصلی */}
        <LiquidGlassCard
          className="p-6 mb-6"
          borderRadius="16px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                {admin.name?.charAt(0) || "A"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{admin.name}</h2>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Shield size={14} />
                  <span>{roleLabels[admin.role] || admin.role}</span>
                  <span className="text-white/20">|</span>
                  <Calendar size={14} />
                  <span>
                    عضو از{" "}
                    {new Date(admin.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                نام کامل
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder:text-white/40 focus:outline-none transition-all duration-200 ${
                    editing
                      ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/50"
                      : "border-white/10 cursor-not-allowed opacity-70"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                شماره تلفن
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder:text-white/40 focus:outline-none transition-all duration-200 ${
                    editing
                      ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/50"
                      : "border-white/10 cursor-not-allowed opacity-70"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                ایمیل
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder:text-white/40 focus:outline-none transition-all duration-200 ${
                    editing
                      ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/50"
                      : "border-white/10 cursor-not-allowed opacity-70"
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {editing ? (
                <>
                  <GlassButton
                    variant="primary"
                    size="md"
                    loading={saving}
                    icon={<Save size={18} />}
                    iconPosition="left"
                    onClick={handleSave}
                  >
                    ذخیره
                  </GlassButton>
                  <GlassButton
                    variant="white"
                    size="md"
                    icon={<X size={18} />}
                    iconPosition="left"
                    onClick={handleCancel}
                  >
                    انصراف
                  </GlassButton>
                </>
              ) : (
                <GlassButton
                  variant="primary"
                  size="md"
                  icon={<Edit2 size={18} />}
                  iconPosition="left"
                  onClick={handleEdit}
                >
                  ویرایش اطلاعات
                </GlassButton>
              )}
            </div>
          </div>
        </LiquidGlassCard>

        {/* تغییر رمز عبور */}
        <LiquidGlassCard
          className="p-6"
          borderRadius="16px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            🔒 تغییر رمز عبور
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleChangePassword();
            }}
          >
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={admin.phone || admin.name || "admin"}
              className="hidden"
              readOnly
            />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  رمز عبور فعلی
                </label>
                <input
                  type="password"
                  name="current"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  رمز عبور جدید
                </label>
                <input
                  type="password"
                  name="new"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  تکرار رمز عبور جدید
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              className="mt-4"
            >
              تغییر رمز عبور
            </GlassButton>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
