// src/pages/auth/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api/auth";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { Phone, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("📤 ارسال درخواست ورود:", {
        phone: formData.phone,
        password: formData.password,
      });

      const response = await authAPI.loginUser({
        phone: formData.phone,
        password: formData.password,
      });

      console.log("📥 پاسخ:", response);

      if (response.success && response.token) {
        authAPI.saveToken(response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/profile");
      } else {
        setError(response.error || "خطا در ورود");
      }
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.error || "خطا در ورود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-block mb-4">
          <LiquidGlassCard
            className="px-4 py-2"
            borderRadius="100px"
            blurIntensity="sm"
            glowIntensity="sm"
            hoverScale={1.05}
          >
            <span className="text-gray-300 flex items-center gap-2 text-sm">
              <ArrowLeft size={16} />
              بازگشت به صفحه اصلی
            </span>
          </LiquidGlassCard>
        </Link>

        <LiquidGlassCard
          className="p-8"
          borderRadius="32px"
          blurIntensity="lg"
          glowIntensity="md"
          shadowIntensity="lg"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">📱</div>
            <h1 className="text-3xl font-bold text-white">ورود</h1>
            <p className="text-white/60 mt-2">با شماره تلفن وارد شوید</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                شماره تلفن
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                  dir="ltr"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <GlassButton
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              loading={loading}
              icon={<span>→</span>}
              iconPosition="left"
            >
              ورود
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              حساب کاربری ندارید؟{" "}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-medium transition"
              >
                ثبت‌نام کنید
              </Link>
            </p>
          </div>
        </LiquidGlassCard>
      </div>
    </section>
  );
}
