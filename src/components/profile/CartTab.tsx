// src/components/Cart/CartTab.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { CartItemComponent } from "../Cart/CartItem";
import { CouponInput } from "../Cart/CouponInput";
import { CartSummary } from "../Cart/CartSummary";
import { EmptyCart } from "../Cart/EmptyCart";
import { LoadingSkeleton } from "../skeletons/LoadingSkeleton";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { PaymentMethodModal } from "../payment/PaymentMethodModal";
import BalePayment from "../payment/BalePayment";
import CardToCardPayment from "../payment/CardToCardPayment";
import { toast } from "sonner";
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    enrollmentId: string;
    amount: number;
    title: string;
  } | null>(null);

  const [showBalePayment, setShowBalePayment] = useState(false);
  const [showCardToCard, setShowCardToCard] = useState(false);

  const items = externalCart !== undefined ? externalCart : displayItems;
  const loading = externalLoading !== undefined ? externalLoading : isLoading;

  // ✅ تابع refresh با auto-refresh
  const refreshCart = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error("❌ خطا در به‌روزرسانی:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, onRefresh]);

  // ✅ Auto-refresh بعد از هر عملیات
  const autoRefresh = useCallback(async () => {
    await refreshCart();
  }, [refreshCart]);

  // ✅ رفرش دستی
  const handleRefresh = useCallback(async () => {
    await refreshCart();
    toast.success("✅ سبد خرید به‌روزرسانی شد");
  }, [refreshCart]);

  // ✅ حذف آیتم با auto-refresh
  const handleRemove = useCallback(
    async (id: string) => {
      try {
        if (onRemoveFromCart) {
          await onRemoveFromCart(id);
        } else {
          removeFromCart(id);
        }
        // ✅ Auto-refresh بعد از حذف
        await autoRefresh();
        toast.success("✅ آیتم از سبد خرید حذف شد");
      } catch (error) {
        console.error("❌ خطا در حذف:", error);
        toast.error("❌ خطا در حذف آیتم");
      }
    },
    [onRemoveFromCart, removeFromCart, autoRefresh],
  );

  // ✅ اعمال کد تخفیف با auto-refresh
  const handleApplyCoupon = useCallback(
    async (code: string) => {
      try {
        applyCoupon({ code });
        // ✅ Auto-refresh بعد از اعمال کد تخفیف
        await autoRefresh();
      } catch (error) {
        console.error("❌ خطا در اعمال کد تخفیف:", error);
      }
    },
    [applyCoupon, autoRefresh],
  );

  // ✅ حذف کد تخفیف با auto-refresh
  const handleRemoveCoupon = useCallback(async () => {
    if (couponCode) {
      try {
        removeCoupon({ code: couponCode });
        // ✅ Auto-refresh بعد از حذف کد تخفیف
        await autoRefresh();
      } catch (error) {
        console.error("❌ خطا در حذف کد تخفیف:", error);
      }
    }
  }, [removeCoupon, couponCode, autoRefresh]);

  // ✅ باز کردن مودال پرداخت
  const handleOpenPaymentMethod = useCallback(() => {
    if (items.length === 0) {
      toast.warning("سبد خرید شما خالی است");
      return;
    }

    const enrollmentIds = items
      .map((item: any) => item.enrollment_id || item.id)
      .filter(Boolean);

    if (enrollmentIds.length === 0) {
      toast.error("❌ شناسه ثبت‌نام یافت نشد");
      return;
    }

    const enrollmentIdString = enrollmentIds.join(",");
    const courseTitle = items
      .map((item: any) => item?.title ?? "دوره")
      .join(" - ");

    setPaymentData({
      enrollmentId: enrollmentIdString,
      amount: totalPrice ?? 0,
      title: courseTitle || `پرداخت ${items.length} دوره`,
    });

    setShowPaymentModal(true);
  }, [items, totalPrice]);

  // ✅ انتخاب روش پرداخت بله
  const handleSelectBale = useCallback(() => {
    setShowPaymentModal(false);
    setShowBalePayment(true);
  }, []);

  // ✅ انتخاب روش کارت به کارت
  const handleSelectCardToCard = useCallback(() => {
    setShowPaymentModal(false);
    setShowCardToCard(true);
  }, []);

  // ✅ بازگشت از پرداخت
  const handlePaymentBack = useCallback(() => {
    setShowBalePayment(false);
    setShowCardToCard(false);
    setPaymentData(null);
    // ✅ Auto-refresh بعد از بازگشت
    autoRefresh();
    if (items.length > 0) {
      setShowPaymentModal(true);
    }
  }, [items, autoRefresh]);

  // ✅ موفقیت در پرداخت با auto-refresh
  const handlePaymentSuccess = useCallback(async () => {
    setShowBalePayment(false);
    setShowCardToCard(false);
    setShowPaymentModal(false);
    setPaymentData(null);

    // ✅ Auto-refresh بعد از پرداخت
    await autoRefresh();
    toast.success("✅ پرداخت با موفقیت انجام شد! منتظر تایید ادمین باشید.");
    navigate("/profile");
  }, [autoRefresh, navigate]);

  // ✅ گوش دادن به رویداد cartUpdated
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log("🔄 رویداد cartUpdated دریافت شد - رفرش خودکار");
      autoRefresh();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [autoRefresh]);

  // ✅ رفرش خودکار هر 30 ثانیه (اختیاری)
  useEffect(() => {
    const interval = setInterval(() => {
      if (items.length > 0) {
        // فقط در صورتی که سبد خرید خالی نباشد
        console.log("🔄 رفرش خودکار دوره‌ای");
        autoRefresh();
      }
    }, 30000); // 30 ثانیه

    return () => clearInterval(interval);
  }, [items.length, autoRefresh]);

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  const isFree = (totalPrice ?? 0) === 0 && items.length > 0;

  // ✅ نمایش پرداخت بله
  if (showBalePayment && paymentData) {
    return (
      <div className="max-w-lg mx-auto">
        <BalePayment
          enrollmentId={paymentData.enrollmentId}
          amount={paymentData.amount}
          onSuccess={handlePaymentSuccess}
          onBack={handlePaymentBack}
        />
      </div>
    );
  }

  // ✅ نمایش پرداخت کارت به کارت
  if (showCardToCard && paymentData) {
    return (
      <div className="max-w-lg mx-auto">
        <CardToCardPayment
          enrollmentId={paymentData.enrollmentId}
          amount={paymentData.amount}
          originalAmount={totalOriginalPrice ?? 0}
          discountAmount={(totalDiscount ?? 0) + (couponDiscount ?? 0)}
          couponCode={couponCode}
          onSuccess={handlePaymentSuccess}
          onBack={handlePaymentBack}
        />
      </div>
    );
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
              key={item.id || item.enrollment_id || `item-${Math.random()}`}
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
          totalOriginalPrice={totalOriginalPrice ?? 0}
          totalDiscount={totalDiscount ?? 0}
          couponDiscount={couponDiscount ?? 0}
          totalPrice={totalPrice ?? 0}
          totalItems={items.length ?? 0}
          onCheckout={handleOpenPaymentMethod}
        />
      </LiquidGlassCard>

      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentData(null);
          // ✅ Auto-refresh بعد از بستن مودال
          autoRefresh();
        }}
        amount={totalPrice ?? 0}
        isFree={isFree}
        onSelectBale={handleSelectBale}
        onSelectCardToCard={handleSelectCardToCard}
      />
    </div>
  );
};
