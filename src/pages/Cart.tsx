// src/pages/Cart.tsx
// import React from "react";
import { useNavigate } from "react-router-dom";
// import { useCart } from "../hooks/useCart";
import { CartTab } from "../components/profile/CartTab"; // ✅ مسیر درست
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
// import { GlassButton } from "../components/ui/GlassButton";
import { ArrowLeft } from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          بازگشت
        </button>

        <LiquidGlassCard
          className="p-6"
          borderRadius="24px"
          blurIntensity="xl"
          glowIntensity="md"
        >
          <CartTab standalone />
        </LiquidGlassCard>
      </div>
    </div>
  );
}
