// src/pages/auth/ForgotPassword.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api/auth";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { Phone, Key, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "reset">("phone");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);

  // ✅ ارسال کد OTP
  const handleSendOTP = async () => {
    if (!phone || phone.length < 11) {
      toast.error("لطفاً شماره تلفن معتبر وارد کنید");
      return;
    }

    setLoading(true);
    try {
      await authAPI.requestOTP(phone);
      setStep("reset");
      setTimer(180);
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

  // ✅ بازنشانی رمز عبور با OTP (بدون مرحله verify جداگانه)
  const handleResetPassword = async () => {
    if (!otpCode || otpCode.length < 5) {
      toast.error("لطفاً کد تایید را وارد کنید");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }

    setLoading(true);
    try {
      // ✅ ارسال همزمان OTP و رمز جدید
      await authAPI.resetPasswordWithOTP(phone, otpCode, newPassword);
      toast.success(" رمز عبور با موفقیت تغییر کرد");
      navigate("/login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || err?.message || "خطا در تغییر رمز عبور",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ ارسال مجدد کد
  const handleResendOTP = async () => {
    if (timer > 0) return;

    setLoading(true);
    try {
      await authAPI.requestOTP(phone);
      setTimer(180);
      toast.success(" کد تایید مجدداً ارسال شد");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="ml-2" />
          بازگشت به ورود
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
              {step === "phone" && "بازیابی رمز عبور"}
              {step === "reset" && "تنظیم رمز جدید"}
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {step === "phone" && "شماره تلفن خود را وارد کنید"}
              {step === "reset" && "کد تایید و رمز عبور جدید را وارد کنید"}
            </p>
          </div>

          {/* مرحله 1: شماره تلفن */}
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
                  />
                </div>
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
            </div>
          )}

          {/* مرحله 2: تایید OTP + تنظیم رمز جدید */}
          {step === "reset" && (
            <div className="space-y-4">
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
                    onClick={handleResendOTP}
                    disabled={timer > 0 || loading}
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

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  رمز عبور جدید
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  تکرار رمز عبور جدید
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="تکرار رمز عبور"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <GlassButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep("phone")}
                  className="flex-1"
                >
                  بازگشت
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={loading}
                  onClick={handleResetPassword}
                  className="flex-1"
                >
                  {loading ? "در حال تغییر..." : "تغییر رمز عبور"}
                </GlassButton>
              </div>
            </div>
          )}
        </LiquidGlassCard>
      </div>
    </div>
  );
}
