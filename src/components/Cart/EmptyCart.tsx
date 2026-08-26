// src/components/Cart/EmptyCart.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { ShoppingCart } from "lucide-react";

export const EmptyCart: React.FC = () => {
  const navigate = useNavigate();

  return (
    <LiquidGlassCard
      className="p-8 text-center"
      borderRadius="20px"
      blurIntensity="lg"
      glowIntensity="md"
    >
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-12 h-12 text-white/20" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">سبد خرید خالی است</h3>
        <p className="text-gray-400 text-sm mb-6">
          هیچ دوره‌ای در انتظار پرداخت نیست
        </p>
        <GlassButton variant="primary" onClick={() => navigate("/events")}>
          مشاهده رویدادها
        </GlassButton>
      </div>
    </LiquidGlassCard>
  );
};
