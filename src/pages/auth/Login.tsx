import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api/auth";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { Phone, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      if (response && response.token) {
        // 🔥 توکن و کاربر ذخیره می‌شود (در authAPI انجام می‌شود)
        // اما برای اطمینان، دوباره بررسی می‌کنیم
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        
        console.log("✅ توکن ذخیره شد:", !!token);
        console.log("✅ کاربر ذخیره شد:", !!user);

        // 🔥 هدایت به پروفایل
        navigate("/profile", { replace: true });
      } else {
        setError("خطا در ورود، لطفاً دوباره تلاش کنید");
      }
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err?.message || "خطا در ورود، لطفاً دوباره تلاش کنید");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} className="ml-2" />
          بازگشت به صفحه اصلی
        </Link>

        <LiquidGlassCard
          className="p-8"
          borderRadius="24px"
          blurIntensity="lg"
          glowIntensity="md"
          shadowIntensity="lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">ورود به حساب</h1>
            <p className="text-gray-400 text-sm mt-2">
              خوش آمدید! برای ادامه وارد حساب خود شوید
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
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
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? "در حال ورود..." : "ورود"}
            </GlassButton>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              حساب کاربری ندارید؟{" "}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                ثبت‌نام کنید
              </Link>
            </p>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
