// src/components/Cart/CartTab.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useCart } from "../../hooks/useCart";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { CouponInput } from "./CouponInput";
import { EmptyCart } from "./EmptyCart";
import { LoadingSkeleton } from "../skeletons/LoadingSkeleton";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { toast } from "../../hooks/use-toast";
import { ShoppingCart, RefreshCw } from "lucide-react";

interface CartTabProps {
  onRefresh?: () => void;
  externalCart?: any[];
  externalLoading?: boolean;
  standalone?: boolean;
  onRemoveFromCart?: (id: string) => Promise<void> | void;
}

export const CartTab: React.FC<CartTabProps> = ({
  onRefresh,
  externalCart,
  externalLoading,
  //   standalone = false,
  onRemoveFromCart,
}) => {
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
  const [, setLocalItems] = useState<any[]>([]);

  // ✅ استفاده از داده‌های خارجی یا داخلی
  const items = externalCart !== undefined ? externalCart : displayItems;
  const loading = externalLoading !== undefined ? externalLoading : isLoading;

  // ✅ وقتی items تغییر میکنه، localItems رو به‌روز کن
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // ✅ رفرش دستی با به‌روزرسانی کامل
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
          // ✅ حذف و سپس رفرش
          await removeFromCart(id);
          // ✅ بعد از حذف، رفرش کن
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

  // ✅ اعمال کد تخفیف
  const handleApplyCoupon = useCallback(
    async (code: string) => {
      try {
        await applyCoupon({ code });
        await refetch(); // ✅ بعد از اعمال، رفرش کن
        if (onRefresh) await onRefresh();
      } catch (error) {
        console.error("❌ خطا در اعمال کد تخفیف:", error);
      }
    },
    [applyCoupon, refetch, onRefresh],
  );

  // ✅ حذف کد تخفیف
  const handleRemoveCoupon = useCallback(async () => {
    if (couponCode) {
      try {
        await removeCoupon({ code: couponCode });
        await refetch(); // ✅ بعد از حذف، رفرش کن
        if (onRefresh) await onRefresh();
      } catch (error) {
        console.error("❌ خطا در حذف کد تخفیف:", error);
      }
    }
  }, [removeCoupon, couponCode, refetch, onRefresh]);

  // ✅ لودینگ
  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  // ✅ سبد خرید خالی
  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
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

      {/* Cart Items */}
      <LiquidGlassCard
        className="p-6"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <div className="space-y-3">
          {items.map((item: any) => (
            <CartItem
              key={item.id || item.enrollment_id}
              item={item}
              onRemove={() => handleRemove(item.enrollment_id || item.id)}
              isRemoving={isRemovingFromCart}
            />
          ))}
        </div>
      </LiquidGlassCard>

      {/* Coupon & Summary */}
      <LiquidGlassCard
        className="p-6"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        {/* Coupon Section */}
        <CouponInput
          onApply={handleApplyCoupon}
          onRemove={handleRemoveCoupon}
          isApplying={isApplyingCoupon}
          currentCoupon={couponCode}
        />

        {/* Summary */}
        <CartSummary
          totalOriginalPrice={totalOriginalPrice}
          totalDiscount={totalDiscount}
          couponDiscount={couponDiscount}
          totalPrice={totalPrice}
          totalItems={items.length}
          onCheckout={() => {
            toast.info("در حال انتقال به درگاه پرداخت...");
          }}
        />
      </LiquidGlassCard>
    </div>
  );
};
