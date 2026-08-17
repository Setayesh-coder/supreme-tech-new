// src/pages/Cart.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enrollmentsAPI } from "../lib/api/enrollments";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";
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
} from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await enrollmentsAPI.getMyEnrollments();
      const pending = data.filter((e: any) => e.paymentStatus === "PENDING");
      setCart(pending);
    } catch (err) {
      console.error("خطا:", err);
      setError("خطا در دریافت سبد خرید");
    } finally {
      setLoading(false);
    }
  };

  // ✅ اصلاح: استفاده از paymentUrl به جای success
  const handlePayment = async (enrollmentId: string) => {
    setProcessingId(enrollmentId);
    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const result = await enrollmentsAPI.processPayment(enrollmentId);
      if (result.paymentUrl) {
        window.open(result.paymentUrl, "_blank");
        setSuccess("✅ لینک پرداخت باز شد");
        setTimeout(() => {
          fetchCart();
          setSuccess("");
        }, 1500);
      } else {
        // ✅ اگر paymentUrl نبود، پرداخت موفق بوده
        setSuccess("✅ پرداخت با موفقیت انجام شد!");
        setTimeout(() => {
          fetchCart();
          setSuccess("");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در پردازش پرداخت");
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
  };

  const handleRemove = async (enrollmentId: string) => {
    if (!confirm("آیا از حذف این آیتم از سبد خرید مطمئن هستید؟")) return;
    try {
      setCart(cart.filter((item) => item.id !== enrollmentId));
      setSuccess("✅ آیتم از سبد خرید حذف شد");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("خطا در حذف آیتم");
    }
  };

  // ✅ اصلاح: استفاده از paymentUrl به جای success
  const handlePayAll = async () => {
    if (cart.length === 0) return;

    const totalPrice = cart.reduce((sum, item) => sum + item.event.price, 0);
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
        // ✅ اگر paymentUrl وجود نداشت، پرداخت موفق بوده
        if (!result.paymentUrl) {
          // پرداخت موفق
          continue;
        }
        // اگر paymentUrl داشت، لینک پرداخت باز میشه
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

  const totalPrice = cart.reduce((sum, item) => sum + item.event.price, 0);
  const isFree = totalPrice === 0 && cart.length > 0;

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
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-pink-600/30 backdrop-blur-sm border border-white/10 p-6">
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
                  {formatPrice(totalPrice)}
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
                icon={<ArrowRight className="w-4 h-4" />}
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
                        {item.event.image ? (
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
                          {item.event.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.event.date).toLocaleDateString(
                              "fa-IR",
                            )}
                          </span>
                          <span className="flex items-center gap-1 text-blue-400 font-medium">
                            <Wallet className="w-3 h-3" />
                            {formatPrice(item.event.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <GlassButton
                          variant="primary"
                          size="sm"
                          loading={isProcessing}
                          disabled={isProcessing || processing}
                          icon={<CreditCard className="w-4 h-4" />}
                          iconPosition="left"
                          onClick={() => handlePayment(item.id)}
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
                      </div>
                    </div>
                  </LiquidGlassCard>
                );
              })}
            </div>

            {/* Summary */}
            <LiquidGlassCard
              className="p-6"
              borderRadius="20px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400">تعداد دوره‌ها</p>
                  <p className="text-xl font-bold text-white">
                    {cart.length} دوره
                  </p>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-sm text-gray-400">مبلغ قابل پرداخت</p>
                  <p className="text-3xl font-bold text-white">
                    {formatPrice(totalPrice)}
                  </p>
                  {isFree && (
                    <p className="text-xs text-green-400 mt-1">
                      ✨ همه دوره‌ها رایگان هستند
                    </p>
                  )}
                </div>

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
              </div>

              {!isFree && cart.length > 0 && (
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
    </section>
  );
}
