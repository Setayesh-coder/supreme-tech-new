// src/components/Cart/CartTab.tsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { CartItemComponent } from "./CartItem";
import { CouponInput } from "./CouponInput";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
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

  // ✅ اصلاح: حذف با مدیریت صحیح Confirm
  const handleRemove = useCallback(
    async (id: string) => {
      try {
        if (onRemoveFromCart) {
          // ✅ والد (Profile) کار حذف و Confirm رو انجام میده
          await onRemoveFromCart(id);
          // ✅ بعد از حذف، رفرش کن
          if (onRefresh) {
            await onRefresh();
          }
          // ✅ toast رو والد خودش میزنه، اینجا نیازی نیست
        } else {
          // ✅ حالت standalone (بدون والد)
          removeFromCart(id);
          await refetch();
          toast.success("✅ آیتم از سبد خرید حذف شد");
        }
      } catch (error) {
        console.error("❌ خطا در حذف:", error);
        // ✅ فقط اگه والد نباشه، toast خطا نشون بده
        if (!onRemoveFromCart) {
          toast.error("❌ خطا در حذف آیتم");
        }
      }
    },
    [onRemoveFromCart, removeFromCart, refetch, onRefresh],
  );

  const handleApplyCoupon = useCallback(
    async (code: string) => {
      try {
        applyCoupon({ code });
        await refetch();
        if (onRefresh) await onRefresh();
      } catch (error) {
        console.error("❌ خطا در اعمال کد تخفیف:", error);
      }
    },
    [applyCoupon, refetch, onRefresh],
  );

  const handleRemoveCoupon = useCallback(async () => {
    if (couponCode) {
      try {
        removeCoupon({ code: couponCode });
        await refetch();
        if (onRefresh) await onRefresh();
      } catch (error) {
        console.error("❌ خطا در حذف کد تخفیف:", error);
      }
    }
  }, [removeCoupon, couponCode, refetch, onRefresh]);

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

  const handleSelectBale = useCallback(() => {
    setShowPaymentModal(false);
    setShowBalePayment(true);
  }, []);

  const handleSelectCardToCard = useCallback(() => {
    setShowPaymentModal(false);
    setShowCardToCard(true);
  }, []);

  const handlePaymentBack = useCallback(() => {
    setShowBalePayment(false);
    setShowCardToCard(false);
    setPaymentData(null);
    if (items.length > 0) {
      setShowPaymentModal(true);
    }
  }, [items]);

  const handlePaymentSuccess = useCallback(async () => {
    setShowBalePayment(false);
    setShowCardToCard(false);
    setShowPaymentModal(false);
    setPaymentData(null);

    await refetch();
    if (onRefresh) await onRefresh();

    toast.success("✅ پرداخت با موفقیت انجام شد! منتظر تایید ادمین باشید.");
    navigate("/profile");
  }, [refetch, onRefresh, navigate]);

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  const isFree = (totalPrice ?? 0) === 0 && items.length > 0;

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
        }}
        amount={totalPrice ?? 0}
        isFree={isFree}
        onSelectBale={handleSelectBale}
        onSelectCardToCard={handleSelectCardToCard}
      />
    </div>
  );
};
