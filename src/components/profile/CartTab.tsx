// src/components/profile/CartTab.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../../lib/api/cart";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import PaymentModal from "../payment/PaymentModal";
import CardToCardPayment from "../payment/CardToCardPayment";
import BalePayment from "../payment/BalePayment";
import {
  ShoppingCart,
  CreditCard,
  Trash2,
  Calendar,
  Wallet,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
  Ticket,
  X,
  Bot,
  Banknote,
  Gift,
  Percent,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

// ✅ Interface برای props
interface CartTabProps {
  externalCart?: any[];
  externalLoading?: boolean;
  onRefresh?: () => void;
  standalone?: boolean;
  onRemoveFromCart?: (id: string) => void;
}

// ✅ تایپ برای خلاصه سبد خرید
interface CartSummary {
  total_original_price: number;
  total_courses_discount: number;
  coupon_code?: string;
  coupon_discount?: number;
  total_payable?: number;
}

// ✅ تایپ برای پاسخ سبد خرید
// interface CartResponse {
//   items: any[];
//   summary?: CartSummary; // ✅ optional چون ممکن است وجود نداشته باشد
// }

export function CartTab({
  externalCart,
  externalLoading,
  onRefresh,
  standalone = false,
  onRemoveFromCart,
}: CartTabProps) {
  const navigate = useNavigate();

  const [internalCart, setInternalCart] = useState<any[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  const cart = externalCart !== undefined ? externalCart : internalCart;
  const loading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    code: string;
    discount_amount: number;
    final_total: number;
    type: "PERCENT" | "FIXED";
    value: number;
  } | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showCardToCard, setShowCardToCard] = useState(false);
  const [showBalePayment, setShowBalePayment] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    enrollmentId: string;
    amount: number;
    title: string;
  } | null>(null);

  const isLoggedIn = !!localStorage.getItem("token");

  // ✅ تابع رفرش سبد خرید
  const refreshCart = useCallback(
    async (showLoading: boolean = true) => {
      if (!isLoggedIn) return;

      try {
        if (showLoading) setInternalLoading(true);
        setError("");

        const cartData = (await cartAPI.getCart()) as any; // ✅ استفاده از as any
        console.log("🛒 سبد خرید به‌روزرسانی شد:", cartData);

        const items = cartData.items || [];
        const mappedCart = items.map((item: any) => ({
          id: item.enrollment_id,
          enrollment_id: item.enrollment_id,
          course_id: item.course_id,
          event: {
            id: item.course_id,
            title: item.course_title || "دوره آموزشی",
            slug: item.course_slug || "",
            date: item.created_at || new Date().toISOString(),
            price: item.discounted_price || item.original_price || 0,
            image: item.course_image || "",
            duration: "",
            meetingLink: "",
          },
        }));

        setInternalCart(mappedCart);

        // ✅ اگر discountInfo وجود دارد، از اطلاعات سرور به‌روزرسانی کن
        if (discountInfo && cartData.summary) {
          const summary = cartData.summary as CartSummary;
          if (summary.coupon_code) {
            const isPercent =
              summary.coupon_discount && summary.total_original_price > 0
                ? (summary.coupon_discount / summary.total_original_price) * 100
                : 0;

            setDiscountInfo({
              code: summary.coupon_code,
              discount_amount: summary.coupon_discount || 0,
              final_total:
                summary.total_payable || summary.total_original_price || 0,
              type: isPercent > 0 && isPercent < 100 ? "PERCENT" : "FIXED",
              value:
                isPercent > 0 && isPercent < 100
                  ? Math.round(isPercent)
                  : summary.coupon_discount || 0,
            });
          }
        }

        return mappedCart;
      } catch (err) {
        console.error("❌ خطا در به‌روزرسانی سبد خرید:", err);
        setError("خطا در به‌روزرسانی سبد خرید");
        return [];
      } finally {
        if (showLoading) setInternalLoading(false);
      }
    },
    [isLoggedIn, discountInfo],
  );

  // ✅ دریافت داده‌های سبد خرید (بارگذاری اولیه)
  const fetchCart = useCallback(async () => {
    if (!standalone || externalCart !== undefined) return;
    await refreshCart(true);
  }, [standalone, externalCart, refreshCart]);

  // ✅ اعمال کد تخفیف
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("لطفاً کد تخفیف را وارد کنید");
      return;
    }

    setApplyingCoupon(true);
    setError("");
    setSuccess("");

    try {
      const code = couponCode.trim().toUpperCase();

      // 1. اعمال کد تخفیف
      const result = await cartAPI.applyCoupon({ code });
      console.log("✅ کد تخفیف اعمال شد:", result);

      // 2. دریافت سبد خرید به‌روز شده
      const cartData = (await cartAPI.getCart()) as any;
      console.log("🛒 سبد خرید به‌روزرسانی شد:", cartData);

      // 3. استخراج اطلاعات تخفیف از summary
      const summary = (cartData.summary || {}) as CartSummary;

      // 4. تنظیم discountInfo با اطلاعات واقعی از سرور
      if (summary.coupon_code) {
        const isPercent =
          summary.coupon_discount && summary.total_original_price > 0
            ? (summary.coupon_discount / summary.total_original_price) * 100
            : 0;

        setDiscountInfo({
          code: summary.coupon_code,
          discount_amount: summary.coupon_discount || 0,
          final_total:
            summary.total_payable || summary.total_original_price || 0,
          type: isPercent > 0 && isPercent < 100 ? "PERCENT" : "FIXED",
          value:
            isPercent > 0 && isPercent < 100
              ? Math.round(isPercent)
              : summary.coupon_discount || 0,
        });
      } else {
        // fallback: اگر در summary نبود، از result استفاده کن
        setDiscountInfo({
          code: result.coupon?.code || code,
          discount_amount: result.discount || 0,
          final_total: result.final_total || 0,
          type: result.coupon?.type || "PERCENT",
          value: result.coupon?.discount_value || 0,
        });
      }

      setSuccess(`✅ کد تخفیف "${code}" با موفقیت اعمال شد!`);
      setCouponCode("");

      // 5. رفرش سبد خرید
      await refreshCart(false);

      if (onRefresh) onRefresh();

      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      console.error("❌ خطا در اعمال کد تخفیف:", err);
      setError(err.response?.data?.detail || "❌ کد تخفیف نامعتبر است");
      setTimeout(() => setError(""), 3000);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // ✅ حذف کد تخفیف
  const handleRemoveCoupon = async () => {
    try {
      await cartAPI.removeCoupon({ code: discountInfo?.code || "" });
      setDiscountInfo(null);
      setSuccess("✅ کد تخفیف با موفقیت حذف شد");

      await refreshCart(false);

      if (onRefresh) onRefresh();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ خطا در حذف کد تخفیف:", err);
      setError("خطا در حذف کد تخفیف");
      setTimeout(() => setError(""), 3000);
    }
  };

  // ✅ حذف از سبد خرید
  const handleRemove = async (enrollmentId: string) => {
    if (!window.confirm("آیا از حذف این آیتم از سبد خرید مطمئن هستید؟")) return;

    setProcessing(true);

    try {
      if (onRemoveFromCart) {
        await onRemoveFromCart(enrollmentId);
      } else {
        await cartAPI.removeFromCart(enrollmentId);
      }

      setSuccess("✅ آیتم از سبد خرید حذف شد");
      await refreshCart(false);

      if (onRefresh) onRefresh();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      console.error("❌ خطا در حذف آیتم:", err);
      setError(err.response?.data?.detail || "خطا در حذف آیتم");
      setTimeout(() => setError(""), 3000);
    } finally {
      setProcessing(false);
    }
  };

  // ✅ رفرش دستی
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCart(true);
      setSuccess("✅ سبد خرید به‌روزرسانی شد");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("خطا در به‌روزرسانی سبد خرید");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✅ بعد از پرداخت موفق
  const handlePaymentSuccess = async () => {
    setShowCardToCard(false);
    setShowBalePayment(false);
    setShowPaymentMethodModal(false);
    setPaymentData(null);

    await refreshCart(false);

    if (onRefresh) onRefresh();

    setSuccess("✅ پرداخت با موفقیت انجام شد! منتظر تایید ادمین باشید.");
    setTimeout(() => setSuccess(""), 5000);
  };

  // ✅ باز کردن مودال انتخاب روش پرداخت
  const handleOpenPaymentMethodModal = async () => {
    if (!isLoggedIn) {
      setError("❌ لطفاً ابتدا وارد حساب کاربری خود شوید");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (cart.length === 0) return;

    try {
      const cartData = (await cartAPI.getCart()) as any;
      if (!cartData.items || cartData.items.length === 0) {
        setError("❌ سبد خرید شما خالی یا منقضی شده است");
        await refreshCart(true);
        setTimeout(() => setError(""), 3000);
        return;
      }
    } catch (err) {
      console.error("❌ خطا در بررسی سبد خرید:", err);
      setError("❌ خطا در بررسی سبد خرید");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const totalPrice = cart.reduce(
      (sum, item) => sum + (item.event?.price || 0),
      0,
    );

    const enrollmentIds = cart
      .map((item) => item.enrollment_id || item.id)
      .filter(Boolean);

    if (enrollmentIds.length === 0) {
      setError("❌ شناسه ثبت‌نام یافت نشد");
      return;
    }

    const enrollmentIdString = enrollmentIds.join(",");
    const courseTitle = cart.map((item) => item.event?.title).join(" - ");

    setPaymentData({
      enrollmentId: enrollmentIdString,
      amount: totalPrice,
      title: courseTitle || `پرداخت ${cart.length} دوره`,
    });

    setShowPaymentMethodModal(true);
  };

  const handleSelectPaymentMethod = (method: "bale" | "card") => {
    setShowPaymentMethodModal(false);

    if (method === "bale") {
      setShowBalePayment(true);
    } else {
      setShowCardToCard(true);
    }
  };

  const handlePaymentBack = () => {
    setShowCardToCard(false);
    setShowBalePayment(false);
    setPaymentData(null);
  };

  // ✅ بارگذاری اولیه
  useEffect(() => {
    if (standalone) {
      fetchCart();
    }
  }, [standalone, fetchCart]);

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.event?.price || 0),
    0,
  );
  const isFree = totalPrice === 0 && cart.length > 0;
  const finalTotal = discountInfo ? discountInfo.final_total : totalPrice;
  const discountAmount = discountInfo ? discountInfo.discount_amount : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (showCardToCard && paymentData) {
    return (
      <div className="max-w-lg mx-auto">
        <CardToCardPayment
          enrollmentId={paymentData.enrollmentId}
          amount={paymentData.amount} // مبلغ نهایی با تخفیف
          originalAmount={totalPrice} // قیمت اصلی بدون تخفیف
          discountAmount={discountAmount} // مبلغ تخفیف
          couponCode={discountInfo?.code} // کد تخفیف
          onSuccess={handlePaymentSuccess}
          onBack={handlePaymentBack}
        />
      </div>
    );
  }

  // ✅ اگر پرداخت بله نمایش داده شود
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

  return (
    <div className="space-y-4">
      {/* دکمه رفرش دستی */}
      <div className="flex justify-end">
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "در حال به‌روزرسانی..." : "به‌روزرسانی"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-center text-sm">
          <X className="inline w-4 h-4 ml-1" /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl text-center text-sm animate-in fade-in duration-300">
          {success}
        </div>
      )}

      {cart.length === 0 ? (
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
            <h3 className="text-xl font-bold text-white mb-2">
              سبد خرید خالی است
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              هیچ دوره‌ای در انتظار پرداخت نیست
            </p>
            <GlassButton variant="primary" onClick={() => navigate("/events")}>
              مشاهده رویدادها
            </GlassButton>
          </div>
        </LiquidGlassCard>
      ) : (
        <>
          {/* Cart Items */}
          <LiquidGlassCard
            className="p-6"
            borderRadius="20px"
            blurIntensity="lg"
            glowIntensity="md"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <ShoppingCart className="w-5 h-5 text-orange-400" />
              سبد خرید
              <span className="text-sm text-gray-400 font-normal mr-2">
                ({cart.length} دوره)
              </span>
            </h2>

            <div className="space-y-3">
              {cart.map((item) => (
                <LiquidGlassCard
                  key={item.id}
                  className="p-4 hover:bg-white/5 transition-all duration-300"
                  borderRadius="14px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="w-full md:w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      {item.event?.image ? (
                        <img
                          src={item.event.image}
                          alt={item.event.title}
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
                        {item.event?.title || "دوره آموزشی"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.event?.date
                            ? new Date(item.event.date).toLocaleDateString(
                                "fa-IR",
                              )
                            : "نامشخص"}
                        </span>
                        <span className="flex items-center gap-1 text-blue-400 font-medium">
                          <Wallet className="w-3 h-3" />
                          {formatPrice(item.event?.price || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all duration-300 w-full md:w-auto"
                        disabled={processing}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </LiquidGlassCard>

          {/* Summary + Coupon */}
          <LiquidGlassCard
            className="p-6"
            borderRadius="20px"
            blurIntensity="lg"
            glowIntensity="md"
          >
            {/* Coupon Section */}
            <div className="mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                  <Gift className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-white">کد تخفیف</h3>
                {discountInfo && (
                  <span className="mr-auto text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    اعمال شده
                  </span>
                )}
              </div>

              {discountInfo ? (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-4">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full translate-x-8 -translate-y-8" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500/5 rounded-full -translate-x-6 translate-y-6" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Percent className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-bold font-mono text-lg">
                            {discountInfo.code}
                          </span>
                          <span className="text-xs text-gray-400">
                            (
                            {discountInfo.type === "PERCENT"
                              ? `${discountInfo.value}% تخفیف`
                              : `${discountInfo.value.toLocaleString()} تومان تخفیف`}
                            )
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatPrice(discountInfo.discount_amount)} از مبلغ کل
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      title="حذف کد تخفیف"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
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
                      disabled={applyingCoupon}
                    />
                  </div>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    loading={applyingCoupon}
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="sm:w-auto w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    {applyingCoupon ? "در حال بررسی..." : "اعمال کد"}
                  </GlassButton>
                </div>
              )}
            </div>

            {/* Price Calculation */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>جمع کل</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>تخفیف</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-lg">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-blue-400">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-sm text-gray-400">تعداد دوره‌ها</p>
                <p className="text-xl font-bold text-white">
                  {cart.length} دوره
                </p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm text-gray-400">مبلغ قابل پرداخت</p>
                <p className="text-3xl font-bold text-white">
                  {formatPrice(finalTotal)}
                </p>
                {isFree && (
                  <p className="text-xs text-green-400 mt-1">
                    ✨ همه دوره‌ها رایگان هستند
                  </p>
                )}
              </div>

              {isLoggedIn ? (
                <GlassButton
                  variant="primary"
                  size="lg"
                  loading={processing}
                  disabled={processing || cart.length === 0}
                  icon={
                    isFree ? (
                      <Zap className="w-5 h-5" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )
                  }
                  iconPosition="left"
                  onClick={handleOpenPaymentMethodModal}
                  className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isFree ? "تایید و ثبت‌نام رایگان" : "انتخاب روش پرداخت"}
                </GlassButton>
              ) : (
                <GlassButton
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setError("❌ برای پرداخت باید وارد حساب کاربری خود شوید");
                    setTimeout(() => setError(""), 3000);
                  }}
                  className="w-full md:w-auto"
                >
                  برای پرداخت وارد شوید
                </GlassButton>
              )}
            </div>

            {!isFree && cart.length > 0 && isLoggedIn && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                با پرداخت همه، تمام دوره‌های سبد خرید ثبت‌نام می‌شوند
              </div>
            )}
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
        </>
      )}

      {/* مودال انتخاب روش پرداخت */}
      {showPaymentMethodModal && paymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <LiquidGlassCard
            className="w-full max-w-md p-6 relative"
            borderRadius="24px"
            blurIntensity="xl"
            glowIntensity="md"
          >
            <button
              onClick={() => {
                setShowPaymentMethodModal(false);
                setPaymentData(null);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                انتخاب روش پرداخت
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                مبلغ قابل پرداخت: {formatPrice(paymentData.amount)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {cart.length} دوره برای ثبت‌نام
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSelectPaymentMethod("bale")}
                className="w-full p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all duration-300 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                    پرداخت از طریق بله
                  </h3>
                  <p className="text-gray-400 text-xs">
                    پرداخت خودکار و سریع از طریق ربات بله
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
              </button>

              <button
                onClick={() => handleSelectPaymentMethod("card")}
                className="w-full p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all duration-300 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                    پرداخت کارت به کارت
                  </h3>
                  <p className="text-gray-400 text-xs">
                    واریز به شماره کارت و ارسال رسید
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                🔒 تمامی پرداخت‌ها با امنیت بالا انجام می‌شود
              </p>
            </div>
          </LiquidGlassCard>
        </div>
      )}

      {/* Payment Modal */}
      {isLoggedIn && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedEnrollment(null);
          }}
          enrollmentId={selectedEnrollment?.id || ""}
          amount={selectedEnrollment?.event?.price || 0}
          courseTitle={selectedEnrollment?.event?.title || "دوره آموزشی"}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
