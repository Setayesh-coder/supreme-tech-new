// src/pages/admin/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api/auth";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard"; // ← توجه به نام فایل
import { GlassButton } from "../../components/ui/GlassButton";
import { ArrowRight, Lock, Phone } from "lucide-react";

export default function AdminLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authAPI.loginAdmin({ phone, password });

      if (result.token) {
        authAPI.saveToken(result.token);
        localStorage.setItem(
          "admin",
          JSON.stringify({
            id: result.admin.id,
            name: result.admin.name,
            phone: result.admin.phone,
            role: result.admin.role || "ADMIN",
          }),
        );
        navigate("/admin/dashboard");
      } else {
        setError(result.error || "خطا در ورود");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <LiquidGlassCard
        // draggable={false}
        className="w-full max-w-md p-8"
        borderRadius="32px"
        blurIntensity="sm"
        glowIntensity="md"
        shadowIntensity="lg"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-3xl font-bold text-white">پنل مدیریت</h1>
          <p className="text-white/60 mt-2">سامانه هوشمند Supreme Tech</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              شماره تلفن
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                placeholder="09121234567"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              رمز عبور
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <GlassButton
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              loading={loading}
              icon={!loading ? <ArrowRight className="w-5 h-5" /> : undefined}
              iconPosition="left"
              className="!rounded-xl"
              disabled={loading}
            >
              {loading ? "در حال ورود..." : "ورود به پنل"}
            </GlassButton>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/admin/forgot-password")}
            className="text-white/50 hover:text-white/80 text-sm transition-colors duration-200"
          >
            رمز عبور خود را فراموش کرده‌اید؟
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
