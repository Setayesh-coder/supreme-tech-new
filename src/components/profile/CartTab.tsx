// src/components/profile/CartTab.tsx
import React, { useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { CartItemComponent } from "../Cart/CartItem";
import { CouponInput } from "../Cart/CouponInput";
import { CartSummary } from "../Cart/CartSummary";
import { EmptyCart } from "../Cart/EmptyCart";
import { LoadingSkeleton } from "../skeletons/LoadingSkeleton";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { PaymentMethodModal } from "../payment/PaymentMethodModal";
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
  // standalone = false,
  onRemoveFromCart,
}) => {
  // const navigate = useNavigate();
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
  const [showBalePayment, setShowBalePayment] = useState(false);
  const [showCardToCard, setShowCardToCard] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    enrollmentId: string;
    amount: number;
    title: string;
  } | null>(null);

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

  // ✅ حذف آیتم
  const handleRemove = useCallback(
    async (id: string) => {
      try {
        if (onRemoveFromCart) {
          await onRemoveFromCart(id);
        } else {
          removeFromCart(id);
          await refetch();
        }
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
        applyCoupon({ code });
        await refetch();
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
        removeCoupon({ code: couponCode });
        await refetch();
        if (onRefresh) await onRefresh();
      } catch (error) {
        console.error("❌ خطا در حذف کد تخفیف:", error);
      }
    }
  }, [removeCoupon, couponCode, refetch, onRefresh]);

  // ✅ باز کردن مودال انتخاب روش پرداخت
  const handleOpenPaymentMethod = useCallback(() => {
    if (items.length === 0) {
      toast.warning("سبد خرید شما خالی است");
      return;
    }

    // آماده کردن داده‌های پرداخت
    const enrollmentIds = items
      .map((item: any) => item.enrollment_id || item.id)
      .filter(Boolean);

    if (enrollmentIds.length === 0) {
      toast.error("❌ شناسه ثبت‌نام یافت نشد");
      return;
    }

    const enrollmentIdString = enrollmentIds.join(",");
    const courseTitle = items.map((item: any) => item.title).join(" - ");

    setPaymentData({
      enrollmentId: enrollmentIdString,
      amount: totalPrice,
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
    // باز کردن مجدد مودال انتخاب روش
    if (items.length > 0) {
      setShowPaymentModal(true);
    }
  }, [items]);

  // ✅ موفقیت در پرداخت
  // const handlePaymentSuccess = useCallback(async () => {
  //   setShowBalePayment(false);
  //   setShowCardToCard(false);
  //   setShowPaymentModal(false);
  //   setPaymentData(null);

  //   await refetch();
  //   if (onRefresh) await onRefresh();

  //   toast.success("✅ پرداخت با موفقیت انجام شد! منتظر تایید ادمین باشید.");
  //   navigate("/profile");
  // }, [refetch, onRefresh, navigate]);

  // ✅ لودینگ
  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  // ✅ سبد خرید خالی
  if (items.length === 0) {
    return <EmptyCart />;
  }

  // ✅ اگر کاربر انتخاب کرده، نمایش کامپوننت‌های پرداخت
  if (showBalePayment && paymentData) {
    // اینجا کامپوننت BalePayment رو وارد کنید
    return (
      <div className="max-w-lg mx-auto">
        {/* <BalePayment
          enrollmentId={paymentData.enrollmentId}
          amount={paymentData.amount}
          onSuccess={handlePaymentSuccess}
          onBack={handlePaymentBack}
        /> */}
        <div className="text-white text-center p-8">
          <p>در حال انتقال به پرداخت بله...</p>
          <button onClick={handlePaymentBack} className="mt-4 text-blue-400">
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  if (showCardToCard && paymentData) {
    // اینجا کامپوننت CardToCardPayment رو وارد کنید
    return (
      <div className="max-w-lg mx-auto">
        {/* <CardToCardPayment
          enrollmentId={paymentData.enrollmentId}
          amount={paymentData.amount}
          originalAmount={totalOriginalPrice}
          discountAmount={totalDiscount + couponDiscount}
          couponCode={couponCode}
          onSuccess={handlePaymentSuccess}
          onBack={handlePaymentBack}
        /> */}
        <div className="text-white text-center p-8">
          <p>در حال انتقال به پرداخت کارت به کارت...</p>
          <button onClick={handlePaymentBack} className="mt-4 text-blue-400">
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  const isFree = totalPrice === 0 && items.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <CartItemComponent
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
          onCheckout={handleOpenPaymentMethod}
        />
      </LiquidGlassCard>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentData(null);
        }}
        amount={totalPrice}
        isFree={isFree}
        onSelectBale={handleSelectBale}
        onSelectCardToCard={handleSelectCardToCard}
      />
    </div>
  );
};
