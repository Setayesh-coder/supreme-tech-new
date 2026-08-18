import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../lib/api/admin";
import { employeesAPI } from "../../lib/api/employees";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import {
  User,
  Lock,
  Shield,
  Briefcase,
  UserRoundCog,
  Users,
} from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState<"admin" | "employee">("admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;

      if (loginType === "admin") {
        // ✅ اصلاح: ارسال به صورت شیء
        response = await adminAPI.login({ phone, password });
      } else {
        response = await employeesAPI.login({ phone, password });
      }

      console.log("📥 پاسخ کامل:", response);

      // ✅ بررسی ساختار پاسخ - ممکن است مستقیم یا داخل data باشد
      const data = response.data || response;
      const token = data?.token || response?.token || null;
      const user = data?.user || response?.user || null;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user || { phone }));

        if (loginType === "admin") {
          localStorage.setItem("admin", JSON.stringify(user || { phone }));
        } else {
          localStorage.setItem("employee", JSON.stringify(user || { phone }));
        }

        navigate("/admin/dashboard");
      } else {
        console.error("❌ توکن در پاسخ وجود ندارد:", response);
        setError("پاسخ نامعتبر از سرور");
      }
    } catch (err: any) {
      console.error("❌ خطا:", err);
      console.error("❌ پاسخ خطا:", err.response?.data);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "خطا در ورود",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <LiquidGlassCard
        className="p-8 max-w-md w-full"
        borderRadius="24px"
        blurIntensity="xl"
        glowIntensity="lg"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">
            {loginType === "admin" ? <UserRoundCog /> : <Users />}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {loginType === "admin" ? "ورود به پنل ادمین" : "ورود کارمندان"}
          </h1>
          <p className="text-gray-400 text-sm">
            شماره تماس و رمز عبور خود را وارد کنید
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setLoginType("admin")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              loginType === "admin"
                ? "bg-blue-500/30 text-blue-400 border border-blue-400/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Shield size={16} />
            ادمین
          </button>
          <button
            type="button"
            onClick={() => setLoginType("employee")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              loginType === "employee"
                ? "bg-green-500/30 text-green-400 border border-green-400/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Briefcase size={16} />
            کارمند
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-sm text-center">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              شماره تماس
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثلاً 09123456789"
                className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              رمز عبور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <GlassButton
            type="submit"
            variant={loginType === "admin" ? "primary" : "success"}
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? "در حال ورود..." : "ورود"}
          </GlassButton>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ورود به پنل کاربری
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
