// src/pages/AccessDenied.tsx
import { Link } from "react-router-dom";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";
import { ShieldX, Home, ArrowLeft } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4 relative overflow-hidden">
      {/* پس‌زمینه تزئینی */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <LiquidGlassCard
          className="p-8 text-center"
          borderRadius="32px"
          blurIntensity="lg"
          glowIntensity="md"
          shadowIntensity="lg"
        >
          {/* آیکون */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
              <ShieldX className="w-12 h-12 text-red-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            🚫 دسترسی غیرمجاز
          </h1>
          <p className="text-gray-400 mb-6">
            شما به این بخش دسترسی ندارید.
            <br />
            این صفحه فقط برای مدیران سیستم است.
          </p>

          <div className="flex flex-col gap-3">
            <Link to="/">
              <GlassButton
                fullWidth
                variant="primary"
                size="lg"
                icon={<Home className="w-5 h-5" />}
                iconPosition="left"
                className="!rounded-xl"
              >
                بازگشت به صفحه اصلی
              </GlassButton>
            </Link>

            <Link to="/login">
              <GlassButton
                fullWidth
                variant="white"
                size="md"
                icon={<ArrowLeft className="w-4 h-4" />}
                iconPosition="left"
                className="!rounded-xl"
              >
                ورود با حساب دیگر
              </GlassButton>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500">
              اگر فکر می‌کنید این یک اشتباه است، با پشتیبانی تماس بگیرید.
            </p>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
