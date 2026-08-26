// src/components/profile/CartTab.tsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { toast } from "../../hooks/use-toast";
import {
  ShoppingCart,
  Trash2,
  Calendar,
  Wallet,
  RefreshCw,
  Gift,
  Ticket,
  X,
  Percent,
  CheckCircle,
  CreditCard,
  Zap,
  ArrowRight,
} from "lucide-react";

// ============================================================
// ✅ کامپوننت‌های داخلی
// ============================================================

// 🛒 آیتم سبد خرید
const CartItemComponent = ({
  item,
  onRemove,
  isRemoving,
}: {
  item: any;
  onRemove: () => void;
  isRemoving: boolean;
}) => {
  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  return (
    <LiquidGlassCard
      className="p-4 hover:bg-white/5 transition-all duration-300"
      borderRadius="14px"
      blurIntensity="sm"
      glowIntensity="sm"
    >
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-full md:w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white/20" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">
            {item.title || item.course_title || "دوره آموزشی"}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {item.date
                ? new Date(item.date).toLocaleDateString("fa-IR")
                : "نامشخص"}
            </span>
            <span className="flex items-center gap-1 text-blue-400 font-medium">
              <Wallet className="w-3 h-3" />
              {formatPrice(item.price || 0)}
            </span>
          </div>
        </div>

        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all duration-300 w-full md:w-auto disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </LiquidGlassCard>
  );
};

// 🎫 ورودی کد تخفیف
const CouponInput = ({
  onApply,
  onRemove,
  isApplying,
  currentCoupon,
}: {
  onApply: (code: string) => void;
  onRemove: () => void;
  isApplying: boolean;
  currentCoupon?: string;
}) => {
  const [couponCode, setCouponCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      onApply(couponCode.trim().toUpperCase());
      setCouponCode("");
    }
  };

  if (currentCoupon) {
    return (
      <div className="mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
            <Gift className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-white">کد تخفیف</h3>
          <span className="mr-auto text-xs text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            اعمال شده
          </span>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-4">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Percent className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold font-mono text-lg">
                    {currentCoupon}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  کد تخفیف اعمال شده
                </p>
              </div>
            </div>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 pb-4 border-b border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
          <Gift className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="text-sm font-medium text-white">کد تخفیف</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Ticket className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="کد تخفیف را وارد کنید..."
            className="w-full px-4 py-2.5 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            disabled={isApplying}
          />
        </div>
        <GlassButton
          variant="primary"
          size="sm"
          loading={isApplying}
          type="submit"
          disabled={isApplying || !couponCode.trim()}
          className="sm:w-auto w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {isApplying ? "در حال بررسی..." : "اعمال کد"}
        </GlassButton>
      </form>
    </div>
  );
};

// 📊 خلاصه سبد خرید
const CartSummary = ({
  totalOriginalPrice,
  totalDiscount,
  couponDiscount,
  totalPrice,
  totalItems,
  onCheckout,
}: {
  totalOriginalPrice: number;
  totalDiscount: number;
  couponDiscount: number;
  totalPrice: number;
  totalItems: number;
  onCheckout: () => void;
}) => {
  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  const isFree = totalPrice === 0 && totalItems > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-gray-400">
          <span>جمع کل</span>
          <span>{formatPrice(totalOriginalPrice)}</span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>تخفیف دوره‌ها</span>
            <span>- {formatPrice(totalDiscount)}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-purple-400">
            <span>تخفیف کد</span>
            <span>- {formatPrice(couponDiscount)}</span>
          </div>
        )}

        <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-lg">
          <span>مبلغ قابل پرداخت</span>
          <span className="text-blue-400">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="text-center sm:text-right">
          <p className="text-sm text-gray-400">تعداد دوره‌ها</p>
          <p className="text-xl font-bold text-white">{totalItems} دوره</p>
        </div>

        <GlassButton
          variant="primary"
          size="lg"
          onClick={onCheckout}
          icon={
            isFree ? (
              <Zap className="w-5 h-5" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )
          }
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isFree ? "ثبت‌نام رایگان" : "پرداخت"}
        </GlassButton>
      </div>
    </div>
  );
};

// 🗑️ سبد خرید خالی
const EmptyCart = () => {
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

// ============================================================
// ✅ کامپوننت اصلی CartTab
// ============================================================
interface CartTabProps {
  externalCart?: any[];
  externalLoading?: boolean;
  onRefresh?: () => void;
  standalone?: boolean;
  onRemoveFromCart?: (id: string) => Promise<void> | void;
}

export const CartTab: React.FC<CartTabProps> = ({
  externalCart,
  externalLoading,
  onRefresh,
  // standalone = false,
  onRemoveFromCart,
}) => {
  const navigate = useNavigate();
  const {
    displayItems,
    totalPrice,
    totalOriginalPrice,
    totalDiscount,
    couponDiscount,
    couponCode,
    isLoading,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    refetch,
    isRemovingFromCart,
    isApplyingCoupon,
  } = useCart();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const items = externalCart !== undefined ? externalCart : displayItems;
  const loading = externalLoading !== undefined ? externalLoading : isLoading;

  // ✅ رفرش دستی
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("✅ سبد خرید به‌روزرسانی شد");
      onRefresh?.();
    } catch (error) {
      toast.error("❌ خطا در به‌روزرسانی سبد خرید");
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, onRefresh]);

  // ✅ حذف آیتم با رفرش اجباری
  const handleRemove = useCallback(
    async (id: string) => {
      try {
        if (onRemoveFromCart) {
          await onRemoveFromCart(id);
        } else {
          // ✅ حذف از سبد خرید
          removeFromCart(id);
          // ✅ منتظر میمونیم تا mutation انجام بشه و بعد رفرش
          await new Promise((resolve) => setTimeout(resolve, 300));
          await refetch();
        }

        // ✅ اگر externalCart استفاده میشه، onRefresh رو صدا بزن
        if (externalCart !== undefined && onRefresh) {
          await onRefresh();
        }

        toast.success("✅ آیتم از سبد خرید حذف شد");
      } catch (error) {
        console.error("❌ خطا در حذف:", error);
        toast.error("❌ خطا در حذف آیتم");
      }
    },
    [onRemoveFromCart, removeFromCart, refetch, externalCart, onRefresh],
  );

  // ✅ اعمال کد تخفیف با رفرش
  const handleApplyCoupon = useCallback(
    async (code: string) => {
      try {
        applyCoupon({ code });
        await new Promise((resolve) => setTimeout(resolve, 300));
        await refetch();
        if (onRefresh) await onRefresh();
      } catch (error) {
        console.error("❌ خطا در اعمال کد تخفیف:", error);
      }
    },
    [applyCoupon, refetch, onRefresh],
  );

  // ✅ حذف کد تخفیف با رفرش
  const handleRemoveCoupon = useCallback(async () => {
    if (couponCode) {
      try {
        removeCoupon({ code: couponCode });
        await new Promise((resolve) => setTimeout(resolve, 300));
        await refetch();
        if (onRefresh) await onRefresh();
      } catch (error) {
        console.error("❌ خطا در حذف کد تخفیف:", error);
      }
    }
  }, [removeCoupon, couponCode, refetch, onRefresh]);

  // ✅ پرداخت
  const handleCheckout = useCallback(() => {
    if (items.length === 0) {
      toast.warning("سبد خرید شما خالی است");
      return;
    }
    navigate("/checkout");
  }, [items, navigate]);

  // ✅ لودینگ
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <LiquidGlassCard
            key={i}
            className="p-4 animate-pulse"
            borderRadius="14px"
          >
            <div className="flex gap-4">
              <div className="w-24 h-16 rounded-lg bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-1/4" />
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    );
  }

  // ✅ سبد خرید خالی
  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-orange-400" />
          سبد خرید
          <span className="text-sm text-gray-400 font-normal mr-2">
            ({items.length} دوره)
          </span>
        </h2>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "در حال به‌روزرسانی..." : "به‌روزرسانی"}
        </button>
      </div>

      <LiquidGlassCard
        className="p-6"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <div className="space-y-3">
          {items.map((item: any) => (
            <CartItemComponent
              key={item.id || item.enrollment_id}
              item={item}
              onRemove={() => handleRemove(item.enrollment_id || item.id)}
              isRemoving={isRemovingFromCart}
            />
          ))}
        </div>
      </LiquidGlassCard>

      <LiquidGlassCard
        className="p-6"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <CouponInput
          onApply={handleApplyCoupon}
          onRemove={handleRemoveCoupon}
          isApplying={isApplyingCoupon}
          currentCoupon={couponCode}
        />

        <CartSummary
          totalOriginalPrice={totalOriginalPrice}
          totalDiscount={totalDiscount}
          couponDiscount={couponDiscount}
          totalPrice={totalPrice}
          totalItems={items.length}
          onCheckout={handleCheckout}
        />
      </LiquidGlassCard>

      <div className="text-center">
        <button
          onClick={() => navigate("/events")}
          className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-1 mx-auto"
        >
          <ArrowRight className="w-4 h-4" />
          ادامه مشاهده رویدادها
        </button>
      </div>
    </div>
  );
};
