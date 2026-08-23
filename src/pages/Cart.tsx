// src/pages/Cart.tsx
import { useNavigate } from "react-router-dom"; // ✅ اضافه کردن import
import { useCart } from "../hooks/useCart";
import { CartTab } from "../components/profile/CartTab";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";

export default function Cart() {
  const navigate = useNavigate(); // ✅ اضافه کردن useNavigate
  const { cart, loading, refetch, isCartValid } = useCart(); // ✅ حذف error (چون استفاده نمیشه)

  // نمایش پیام خطا در صورت نامعتبر بودن سبد خرید
  if (!isCartValid && cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <LiquidGlassCard className="p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-bold text-white mb-2">
            سبد خرید به‌روزرسانی شد
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            سبد خرید شما به‌روزرسانی شد. لطفاً دوباره تلاش کنید.
          </p>
          <GlassButton variant="primary" onClick={() => navigate("/events")}>
            مشاهده رویدادها
          </GlassButton>
        </LiquidGlassCard>
      </div>
    );
  }

  // ✅ اصلاح prop - استفاده از externalCart به جای cart
  return (
    <CartTab
      standalone
      externalCart={cart}
      externalLoading={loading}
      onRefresh={refetch}
    />
  );
}
