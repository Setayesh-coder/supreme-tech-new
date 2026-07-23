// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";
import { Home,  } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <LiquidGlassCard className="p-8 text-center" borderRadius="32px" blurIntensity="lg" glowIntensity="md" shadowIntensity="lg">
          <div className="text-8xl mb-4">🤔</div>
          <h1 className="text-4xl font-bold text-white mb-2">۴۰۴</h1>
          <p className="text-gray-400 mb-6">صفحه مورد نظر شما پیدا نشد</p>
          <div className="flex flex-col gap-3">
            <Link to="/">
              <GlassButton fullWidth variant="primary" size="lg" icon={<Home className="w-5 h-5" />} iconPosition="left">
                بازگشت به صفحه اصلی
              </GlassButton>
            </Link>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}