// src/components/profile/CartTab.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../../lib/api/cart";
import { paymentsAPI } from "../../lib/api/payment";
// import { coursesAPI } from "../../lib/api/courses";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import PaymentModal from "../payment/PaymentModal";
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
} from "lucide-react";
import { enrollmentsAPI } from "../../lib/api";

// ✅ لیست کدهای تخفیف معتبر
const VALID_COUPONS: Record<
  string,
  { type: "PERCENT" | "FIXED"; value: number }
> = {
  SUPREME10: { type: "PERCENT", value: 10 },
  SUPREME20: { type: "PERCENT", value: 20 },
  SUPREME50: { type: "PERCENT", value: 50 },
  SUPREME100: { type: "FIXED", value: 100000 },
  WELCOME: { type: "PERCENT", value: 15 },
};

interface CartTabProps {
  externalCart?: any[];
  externalLoading?: boolean;
  onRefresh?: () => void;
  standalone?: boolean;
}

export function CartTab({
  externalCart,
  externalLoading,
  onRefresh,
  standalone = false,
}: CartTabProps) {
  const navigate = useNavigate();

  const [internalCart, setInternalCart] = useState<any[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  const cart = externalCart !== undefined ? externalCart : internalCart;
  const loading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const isLoggedIn = !!localStorage.getItem("token");

  // ✅ دریافت داده‌های سبد خرید - از API سبد خرید
  // ✅ دریافت داده‌های سبد خرید - از API سبد خرید
  const fetchCart = async () => {
    if (!standalone || externalCart !== undefined) return;

    try {
      setInternalLoading(true);
      setError("");

      let cartData: any = { items: [], summary: {} };

      if (isLoggedIn) {
        try {
          cartData = await cartAPI.getCart();
          console.log("🛒 سبد خرید از API:", cartData);
        } catch (err) {
          console.error("❌ خطا در دریافت سبد خرید:", err);
          cartData = { items: [], summary: {} };
        }
      }

      const items = cartData.items || [];
      console.log("📋 آیتم‌های خام سبد خرید:", items);

      // ✅ مپ کردن مستقیم از داده‌های سبد خرید (بدون نیاز به getById)
      const mappedCart = items.map((item: any) => ({
        id: item.enrollment_id, // یا item.id
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

      console.log("✅ سبد خرید نهایی:", mappedCart);
      setInternalCart(mappedCart);

      // ... بقیه کد
    } catch (err) {
      console.error("❌ خطا:", err);
      setError("خطا در دریافت سبد خرید");
    } finally {
      setInternalLoading(false);
    }
  };
  // ✅ محاسبه تخفیف
  const calculateDiscount = (
    total: number,
    discount: typeof discountInfo,
  ): number => {
    if (!discount) return 0;
    if (discount.type === "PERCENT") {
      return (total * discount.value) / 100;
    } else {
      return Math.min(discount.value, total);
    }
  };

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
      const coupon = VALID_COUPONS[code];

      if (!coupon) {
        setError("❌ کد تخفیف نامعتبر است");
        setTimeout(() => setError(""), 3000);
        setApplyingCoupon(false);
        return;
      }

      const total = cart.reduce(
        (sum, item) => sum + (item.event?.price || 0),
        0,
      );
      const discountAmount = calculateDiscount(total, {
        code,
        type: coupon.type,
        value: coupon.value,
        discount_amount: 0,
        final_total: 0,
      });

      const discountData = {
        code,
        type: coupon.type,
        value: coupon.value,
        discount_amount: discountAmount,
        final_total: total - discountAmount,
      };

      setDiscountInfo(discountData);
      setSuccess(`✅ کد تخفیف "${code}" با موفقیت اعمال شد!`);
      setCouponCode("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("❌ خطا در اعمال کد تخفیف");
      setTimeout(() => setError(""), 3000);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // ✅ حذف کد تخفیف
  const handleRemoveCoupon = () => {
    setDiscountInfo(null);
    setSuccess("✅ کد تخفیف با موفقیت حذف شد");
    setTimeout(() => setSuccess(""), 3000);
  };

  // ✅ حذف از سبد خرید - DELETE /api/cart/{id}
  const handleRemove = async (enrollmentId: string) => {
    if (!window.confirm("آیا از حذف این آیتم از سبد خرید مطمئن هستید؟")) return;

    try {
      // 📌 حذف با enrollment_id
      await enrollmentsAPI.delete(enrollmentId);

      if (standalone) {
        setInternalCart(cart.filter((item) => item.id !== enrollmentId));
        await fetchCart();
      } else if (onRefresh) {
        onRefresh();
      }

      setSuccess("✅ آیتم از سبد خرید حذف شد");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      console.error("❌ خطا در حذف آیتم:", err);
      setError(err.response?.data?.detail || "خطا در حذف آیتم");
      setTimeout(() => setError(""), 3000);
    }
  };

  // ✅ پرداخت همه - با انتخاب روش پرداخت
  const handlePayAll = async () => {
    if (!isLoggedIn) {
      setError("❌ لطفاً ابتدا وارد حساب کاربری خود شوید");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (cart.length === 0) return;

    const totalPrice = cart.reduce(
      (sum, item) => sum + (item.event?.price || 0),
      0,
    );

    // انتخاب روش پرداخت
    const paymentMethod = confirm(
      `آیا از پرداخت مبلغ ${totalPrice.toLocaleString()} تومان برای ${cart.length} دوره مطمئن هستید؟\n\n` +
        `روش‌های پرداخت:\n` +
        `• OK → پرداخت از طریق بله (پرداخت خودکار)\n` +
        `• Cancel → پرداخت کارت به کارت (نیاز به تایید ادمین)`,
    );

    setProcessing(true);
    setProcessingId("all");
    setError("");
    setSuccess("");

    try {
      // ✅ استفاده از enrollment_id که در CartItem وجود دارد
      // هر آیتم سبد خرید دارای enrollment_id است
      const enrollmentId = cart[0]?.enrollment_id || cart[0]?.id;

      if (!enrollmentId) {
        setError("شناسه ثبت‌نام یافت نشد");
        setProcessing(false);
        setProcessingId(null);
        return;
      }

      if (paymentMethod) {
        // 📌 پرداخت از طریق بله - POST /api/payment/ble/initiate
        const result = await paymentsAPI.baleInitiate({
          enrollment_id: enrollmentId,
          amount: totalPrice,
          description: `پرداخت ${cart.length} دوره`,
        });

        if (result.payment_url) {
          window.open(result.payment_url, "_blank");
          setSuccess(`✅ لینک پرداخت بله برای ${cart.length} دوره باز شد!`);
        } else {
          setSuccess(`✅ درخواست پرداخت ${cart.length} دوره با موفقیت ثبت شد!`);
        }
      } else {
        // 📌 پرداخت کارت به کارت - POST /api/payment/card-to-card
        // اینجا باید فرم کارت به کارت باز شود
        setSuccess(`✅ لطفاً اطلاعات کارت به کارت را وارد کنید`);
        // می‌توانید یک مودال برای کارت به کارت باز کنید
      }

      setTimeout(() => {
        if (standalone) {
          fetchCart();
        } else if (onRefresh) {
          onRefresh();
        }
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error("❌ خطا در پرداخت:", err);
      setError(
        err.response?.data?.detail || err.message || "خطا در پردازش پرداخت‌ها",
      );
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
  };

  // ✅ باز کردن مودال پرداخت
  const handleOpenPaymentModal = (enrollmentId: string) => {
    if (!isLoggedIn) {
      setError("❌ لطفاً ابتدا وارد حساب کاربری خود شوید");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const enrollment = cart.find(
      (item) =>
        item.id === enrollmentId ||
        item.course_id === enrollmentId ||
        item.eventId === enrollmentId ||
        item.enrollment_id === enrollmentId,
    );

    if (enrollment) {
      setSelectedEnrollment(enrollment);
      setShowPaymentModal(true);
    } else {
      setError("دوره مورد نظر یافت نشد");
      setTimeout(() => setError(""), 3000);
    }
  };

  // ✅ بعد از پرداخت موفق
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedEnrollment(null);
    if (standalone) {
      fetchCart();
    } else if (onRefresh) {
      onRefresh();
    }
    setSuccess("✅ پرداخت با موفقیت انجام شد!");
    setTimeout(() => setSuccess(""), 5000);
  };

  // ✅ بارگذاری اولیه
  useEffect(() => {
    if (standalone) {
      fetchCart();
    }
  }, [standalone]);

  // ✅ بررسی پارامتر payment از URL
  useEffect(() => {
    if (!standalone) return;

    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment");

    if (paymentId && paymentId !== "undefined" && paymentId !== "null") {
      const enrollment = cart.find(
        (item) =>
          item.id === paymentId ||
          item.course_id === paymentId ||
          item.eventId === paymentId ||
          item.enrollment_id === paymentId,
      );

      if (enrollment) {
        setSelectedEnrollment(enrollment);
        setShowPaymentModal(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } else {
        setError("دوره مورد نظر برای پرداخت یافت نشد");
      }
    }
  }, [cart, standalone]);

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

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-center text-sm">
          ❌ {error}
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
              {cart.map((item) => {
                const isProcessing = processingId === item.id;

                return (
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
                        {isLoggedIn ? (
                          <>
                            <GlassButton
                              variant="primary"
                              size="sm"
                              loading={isProcessing}
                              disabled={isProcessing || processing}
                              icon={<CreditCard className="w-4 h-4" />}
                              iconPosition="left"
                              onClick={() => handleOpenPaymentModal(item.id)}
                              className="flex-1 md:flex-none"
                            >
                              پرداخت
                            </GlassButton>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all duration-300"
                              disabled={processing}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setError(
                                "❌ برای پرداخت باید وارد حساب کاربری خود شوید",
                              );
                              setTimeout(() => setError(""), 3000);
                            }}
                            className="flex-1 md:flex-none"
                          >
                            برای پرداخت وارد شوید
                          </GlassButton>
                        )}
                      </div>
                    </div>
                  </LiquidGlassCard>
                );
              })}
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
                <Ticket className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-medium text-white">کد تخفیف</h3>
              </div>

              {discountInfo ? (
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div>
                    <span className="text-green-400 font-bold font-mono">
                      {discountInfo.code}
                    </span>
                    <span className="text-sm text-gray-400 mr-2">
                      (
                      {discountInfo.type === "PERCENT"
                        ? `${discountInfo.value}%`
                        : `${discountInfo.value.toLocaleString()} تومان`}{" "}
                      تخفیف)
                    </span>
                    <span className="text-xs text-green-400 mr-2">
                      ({formatPrice(discountInfo.discount_amount)})
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="کد تخفیف را وارد کنید..."
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
                    disabled={applyingCoupon}
                  />
                  <GlassButton
                    variant="primary"
                    size="sm"
                    loading={applyingCoupon}
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                  >
                    اعمال
                  </GlassButton>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                💡 کدهای معتبر: SUPREME10, SUPREME20, SUPREME50, SUPREME100,
                WELCOME
              </p>
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
                  onClick={handlePayAll}
                  className="w-full md:w-auto"
                >
                  {isFree ? "تایید و ثبت‌نام رایگان" : "پرداخت همه"}
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
