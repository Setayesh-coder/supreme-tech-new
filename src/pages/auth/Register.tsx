// src/pages/auth/Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api/auth";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Key,
} from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);

  // مرحله 1: شماره تلفن
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // مرحله 2: اطلاعات ثبت‌نام
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ ارسال کد OTP
  const handleSendOTP = async () => {
    if (!phone || phone.length < 11) {
      toast.error("لطفاً شماره تلفن معتبر وارد کنید");
      return;
    }

    setLoading(true);
    try {
      await authAPI.requestOTP(phone);

      // ✅ اینجا step رو به otp تغییر میدیم تا فیلد کد نمایش داده بشه
      setStep("otp");
      setTimer(60);

      toast.success(" کد تایید به شماره شما ارسال شد");

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || err?.message || "خطا در ارسال کد",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ تایید OTP
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length < 5) {
      toast.error("لطفاً کد تایید را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyOTP(phone, otpCode);
      setStep("register");
      toast.success(" کد تایید شد، اطلاعات ثبت‌نام را کامل کنید");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || err?.message || "کد تایید نامعتبر است",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ ثبت‌نام نهایی با رمز عبور
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name || formData.name.length < 3) {
      setError("نام و نام خانوادگی را کامل وارد کنید");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.registerUser({
        phone: phone,
        name: formData.name,
        password: formData.password,
        email: formData.email || undefined,
      });

      if (response && response.token) {
        toast.success(" ثبت‌نام با موفقیت انجام شد");
        navigate("/profile", { replace: true });
      } else {
        setError("خطا در ثبت‌نام، لطفاً دوباره تلاش کنید");
      }
    } catch (err: any) {
      console.error(" خطا:", err);
      setError(err?.response?.data?.detail || err?.message || "خطا در ثبت‌نام");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
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
            <h1 className="text-2xl font-bold text-white">
              {step === "phone" && "ثبت‌نام"}
              {step === "otp" && "تایید شماره"}
              {step === "register" && "تکمیل ثبت‌نام"}
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {step === "phone" && "شماره تلفن خود را وارد کنید"}
              {step === "otp" && "کد ارسال شده را وارد کنید"}
              {step === "register" && "اطلاعات خود را کامل کنید"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* ✅ مرحله 1: وارد کردن شماره تلفن */}
          {step === "phone" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  شماره تلفن
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                    dir="ltr"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  کد تایید به این شماره ارسال خواهد شد
                </p>
              </div>

              <GlassButton
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onClick={handleSendOTP}
              >
                {loading ? "در حال ارسال..." : "ارسال کد تایید"}
              </GlassButton>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  قبلاً ثبت‌نام کرده‌اید؟{" "}
                  <Link
                    to="/login"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    وارد شوید
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ✅ مرحله 2: وارد کردن کد OTP - کاربر اینجا کد رو وارد میکنه */}
          {step === "otp" && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                <p className="text-blue-300 text-sm">
                  کد تایید به شماره <span className="font-bold">{phone}</span>{" "}
                  ارسال شد
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  کد تایید
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="کد ۵ رقمی را وارد کنید"
                    maxLength={5}
                    dir="ltr"
                    autoFocus
                  />
                </div>
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={timer > 0}
                    className={`text-xs transition-colors ${
                      timer > 0
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-blue-400 hover:text-blue-300"
                    }`}
                  >
                    {timer > 0 ? `ارسال مجدد (${timer}s)` : "ارسال مجدد کد"}
                  </button>
                </div>
              </div>

              <GlassButton
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onClick={handleVerifyOTP}
              >
                {loading ? "در حال تایید..." : "تایید کد"}
              </GlassButton>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtpCode("");
                }}
                className="text-center text-sm text-gray-400 hover:text-white transition-colors w-full"
              >
                ← بازگشت به مرحله قبل
              </button>
            </div>
          )}

          {/* مرحله 3: تکمیل ثبت‌نام */}
          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                <p className="text-green-300 text-sm">
                  ✅ شماره تلفن {phone} تایید شد
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  نام و نام خانوادگی <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="نام کامل"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  ایمیل (اختیاری)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  رمز عبور <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="حداقل ۶ کاراکتر"
                    required
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

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  تکرار رمز عبور <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="تکرار رمز عبور"
                    required
                  />
                </div>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
              </GlassButton>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  قبلاً ثبت‌نام کرده‌اید؟{" "}
                  <Link
                    to="/login"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    وارد شوید
                  </Link>
                </p>
              </div>
            </form>
          )}
        </LiquidGlassCard>
      </div>
    </div>
  );
}
