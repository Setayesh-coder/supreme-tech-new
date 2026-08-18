// src/pages/Cart.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enrollmentsAPI } from "../lib/api/enrollments";
import { coursesAPI } from "../lib/api/courses";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";
import PaymentModal from "../components/payment/PaymentModal";
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
  ArrowLeft,
  Ticket,
  // CheckCircle,
  X,
} from "lucide-react";

// ✅ لیست کدهای تخفیف معتبر (فرانت‌اند)
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

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ State برای کد تخفیف
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    code: string;
    discount_amount: number;
    final_total: number;
    type: "PERCENT" | "FIXED";
    value: number;
  } | null>(null);

  // ✅ State برای مودال پرداخت
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  // ✅ بررسی آیا کاربر لاگین است
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    // ✅ بازیابی کد تخفیف از localStorage
    const savedDiscount = localStorage.getItem("discountInfo");
    if (savedDiscount) {
      try {
        const parsed = JSON.parse(savedDiscount);
        setDiscountInfo(parsed);
      } catch {
        localStorage.removeItem("discountInfo");
      }
    }
    fetchCart();
  }, []);

  // ✅ دریافت داده‌های سبد خرید
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ اگر کاربر لاگین نیست، فقط از localStorage استفاده کن
      let enrollmentsData = JSON.parse(
        localStorage.getItem("enrollments") || "[]",
      );

      // ✅ اگر لاگین است، از API هم دریافت کن
      if (isLoggedIn) {
        try {
          const apiEnrollments = await enrollmentsAPI.getMyEnrollments();
          // ترکیب داده‌ها
          const combined = [...apiEnrollments, ...enrollmentsData];
          // حذف تکراری‌ها
          enrollmentsData = combined.filter(
            (item, index, self) =>
              self.findIndex(
                (i) => i.id === item.id || i.course_id === item.course_id,
              ) === index,
          );
        } catch (err) {
          console.warn(
            "⚠️ خطا در دریافت از API، فقط از localStorage استفاده می‌شود:",
            err,
          );
        }
      }

      console.log("📥 enrollments:", enrollmentsData);

      // ✅ فیلتر آیتم‌های با وضعیت PENDING یا WAITING_VERIFY
      const pendingItems = enrollmentsData.filter(
        (e: any) =>
          e.paymentStatus === "PENDING" ||
          e.paymentStatus === "WAITING_VERIFY" ||
          e.status === "PENDING",
      );

      console.log("🛒 آیتم‌های سبد خرید (خام):", pendingItems);

      // ✅ دریافت اطلاعات کامل دوره برای هر آیتم
      const mappedCart = await Promise.all(
        pendingItems.map(async (item: any) => {
          const courseId = item.course_id || item.event_id || item.id;

          // اگر event قبلاً وجود دارد و کامل است
          if (
            item.event &&
            item.event.title &&
            item.event.title !== "بدون عنوان"
          ) {
            return {
              ...item,
              id: item.id || courseId,
              event: {
                id: item.event.id || courseId,
                title: item.event.title || "دوره آموزشی",
                slug: item.event.slug || "",
                date: item.event.date || new Date().toISOString(),
                price: item.event.price || 0,
                image: item.event.image || "",
                duration: item.event.duration || "",
                meetingLink: item.event.meetingLink || "",
              },
            };
          }

          // اگر course وجود دارد
          if (item.course && item.course.title) {
            return {
              ...item,
              id: item.id || courseId,
              event: {
                id: item.course.id || courseId,
                title: item.course.title || "دوره آموزشی",
                slug: item.course.slug || "",
                date: item.course.created_at || new Date().toISOString(),
                price: item.course.price || 0,
                image: item.course.cover_image || "",
                duration: item.course.duration_hours
                  ? `${item.course.duration_hours} ساعت`
                  : "",
                meetingLink: "",
              },
            };
          }

          // اگر لاگین است و دوره را از API دریافت کن
          if (isLoggedIn) {
            try {
              const course = await coursesAPI.getById(courseId);
              return {
                ...item,
                id: item.id || courseId,
                event: {
                  id: course.id,
                  title: course.title || "دوره آموزشی",
                  slug: course.slug || "",
                  date: course.created_at || new Date().toISOString(),
                  price: course.price || 0,
                  image: course.cover_image || "",
                  duration: course.duration_hours
                    ? `${course.duration_hours} ساعت`
                    : "",
                  meetingLink: "",
                },
              };
            } catch (error) {
              console.error(`❌ خطا در دریافت دوره ${courseId}:`, error);
            }
          }

          // fallback
          return {
            ...item,
            id: item.id || courseId,
            event: {
              id: courseId,
              title: "دوره آموزشی",
              slug: "",
              date: new Date().toISOString(),
              price: 0,
              image: "",
              duration: "",
              meetingLink: "",
            },
          };
        }),
      );

      console.log("🛒 سبد خرید نهایی:", mappedCart);
      setCart(mappedCart);

      // ✅ اگر کد تخفیف ذخیره شده وجود دارد، قیمت‌ها را به‌روز کن
      if (discountInfo && mappedCart.length > 0) {
        const total = mappedCart.reduce(
          (sum, item) => sum + (item.event?.price || 0),
          0,
        );
        const discountAmount = calculateDiscount(total, discountInfo);
        setDiscountInfo({
          ...discountInfo,
          discount_amount: discountAmount,
          final_total: total - discountAmount,
        });
      }
    } catch (err) {
      console.error("❌ خطا:", err);
      setError("خطا در دریافت سبد خرید");
    } finally {
      setLoading(false);
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

  // ✅ اعمال کد تخفیف (فرانت‌اند)
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
      localStorage.setItem("discountInfo", JSON.stringify(discountData));

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
    localStorage.removeItem("discountInfo");
    setSuccess("✅ کد تخفیف با موفقیت حذف شد");
    setTimeout(() => setSuccess(""), 3000);
  };

  // ✅ بررسی پارامتر payment از URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment");

    if (paymentId && paymentId !== "undefined" && paymentId !== "null") {
      const enrollment = cart.find(
        (item) =>
          item.id === paymentId ||
          item.course_id === paymentId ||
          item.eventId === paymentId,
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
  }, [cart]);

  // ✅ تابع باز کردن مودال پرداخت
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
        item.eventId === enrollmentId,
    );

    if (enrollment) {
      setSelectedEnrollment(enrollment);
      setShowPaymentModal(true);
    } else {
      setError("دوره مورد نظر یافت نشد");
      setTimeout(() => setError(""), 3000);
    }
  };

  // ✅ تابع بعد از پرداخت موفق
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedEnrollment(null);
    fetchCart();
    setSuccess("✅ پرداخت با موفقیت انجام شد! منتظر تایید ادمین باشید.");
    setTimeout(() => setSuccess(""), 5000);
  };

  const handleRemove = async (enrollmentId: string) => {
    if (!isLoggedIn) {
      // اگر لاگین نیست، فقط از localStorage حذف کن
      const enrollments = JSON.parse(
        localStorage.getItem("enrollments") || "[]",
      );
      const updated = enrollments.filter(
        (e: any) => e.id !== enrollmentId && e.course_id !== enrollmentId,
      );
      localStorage.setItem("enrollments", JSON.stringify(updated));

      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCart = cartItems.filter((id: string) => id !== enrollmentId);
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      setCart(cart.filter((item) => item.id !== enrollmentId));
      setSuccess("✅ آیتم از سبد خرید حذف شد");
      setTimeout(() => setSuccess(""), 2000);
      return;
    }

    if (!confirm("آیا از حذف این آیتم از سبد خرید مطمئن هستید؟")) return;
    try {
      const enrollments = JSON.parse(
        localStorage.getItem("enrollments") || "[]",
      );
      const updated = enrollments.filter(
        (e: any) => e.id !== enrollmentId && e.course_id !== enrollmentId,
      );
      localStorage.setItem("enrollments", JSON.stringify(updated));

      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCart = cartItems.filter((id: string) => id !== enrollmentId);
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      setCart(cart.filter((item) => item.id !== enrollmentId));
      setSuccess("✅ آیتم از سبد خرید حذف شد");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("خطا در حذف آیتم");
    }
  };

  // ✅ پرداخت همه
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
    if (
      !confirm(
        `آیا از پرداخت مبلغ ${totalPrice.toLocaleString()} تومان برای ${cart.length} دوره مطمئن هستید؟`,
      )
    ) {
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      for (const item of cart) {
        const result = await enrollmentsAPI.processPayment(item.id);
        if (!result.paymentUrl) {
          continue;
        }
        window.open(result.paymentUrl, "_blank");
      }

      setSuccess(`✅ پرداخت ${cart.length} دوره با موفقیت انجام شد!`);
      setTimeout(() => {
        fetchCart();
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError("خطا در پردازش پرداخت‌ها");
    } finally {
      setProcessing(false);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-pink-600/30 backdrop-blur-sm border border-white/10 p-6 mt-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <ShoppingCart className="w-7 h-7 text-blue-400" />
                سبد خرید
                {cart.length > 0 && (
                  <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                    {cart.length} دوره
                  </span>
                )}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {cart.length === 0
                  ? "هیچ دوره‌ای در سبد خرید شما نیست"
                  : `${cart.length} دوره در انتظار پرداخت`}
              </p>
            </div>
            {cart.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">مجموع قابل پرداخت</p>
                <p className="text-2xl font-bold text-white">
                  {formatPrice(finalTotal)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-center text-sm">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 text-center text-sm animate-in fade-in duration-300">
            {success}
          </div>
        )}

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <LiquidGlassCard
            className="p-12 text-center"
            borderRadius="24px"
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
                هنوز دوره‌ای برای پرداخت انتخاب نکرده‌اید
              </p>
              <GlassButton
                variant="primary"
                onClick={() => navigate("/events")}
                icon={<ArrowLeft className="w-4 h-4" />}
                iconPosition="right"
              >
                مشاهده رویدادها
              </GlassButton>
            </div>
          </LiquidGlassCard>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {cart.map((item) => {
                const isProcessing = processingId === item.id;

                return (
                  <LiquidGlassCard
                    key={item.id}
                    className="p-4 hover:bg-white/5 transition-all duration-300 group"
                    borderRadius="16px"
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

            {/* ✅ بخش جمع‌بندی + کد تخفیف */}
            <LiquidGlassCard
              className="p-6"
              borderRadius="20px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              {/* ✅ کد تخفیف - برای همه کاربران قابل مشاهده است */}
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

              {/* ✅ محاسبه قیمت */}
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
                  <span className="text-blue-400">
                    {formatPrice(finalTotal)}
                  </span>
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

            {/* Continue Shopping */}
            <div className="mt-6 text-center">
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
      </div>

      {/* ✅ مودال پرداخت - فقط برای کاربران لاگین */}
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
    </section>
  );
}
