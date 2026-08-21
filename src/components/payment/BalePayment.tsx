// src/components/payment/BalePayment.tsx
import { useState } from "react";
import { GlassButton } from "../ui/GlassButton";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { ArrowRight, Bot, ExternalLink } from "lucide-react";
import { paymentsAPI } from "../../lib/api/payment";

interface BalePaymentProps {
  enrollmentId: string;
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

export default function BalePayment({
  enrollmentId,
  amount,
  onSuccess,
  onBack,
}: BalePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  const handlePayment = async () => {
    if (!enrollmentId) {
      setError("❌ شناسه ثبت‌نام یافت نشد");
      return;
    }

    setLoading(true);
    setError("");
    setPaymentUrl("");

    try {
      console.log("📤 درخواست پرداخت بله:", {
        enrollment_id: enrollmentId,
        amount: amount,
      });

      const result = await paymentsAPI.baleInitiate({
        enrollment_id: enrollmentId,
        amount: amount,
        description: `پرداخت دوره`,
      });

      console.log("✅ پاسخ بله:", result);

      if (result.payment_link) {
        setPaymentUrl(result.payment_link);
        // باز کردن لینک پرداخت در پنجره جدید
        window.open(result.payment_link, "_blank");

        // بعد از 5 ثانیه (چون کاربر به درگاه رفته) onSuccess صدا می‌شود
        setTimeout(() => {
          onSuccess();
        }, 5000);
      } else {
        setError("❌ لینک پرداخت دریافت نشد");
      }
    } catch (err: any) {
      console.error("❌ خطا در پرداخت بله:", err);
      setError(
        err.response?.data?.detail || err.message || "خطا در پرداخت بله",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت
      </button>

      <LiquidGlassCard
        className="p-4"
        borderRadius="16px"
        blurIntensity="sm"
        glowIntensity="sm"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
            <Bot className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-white font-bold text-lg">
            پرداخت از طریق ربات بله
          </h3>
          <p className="text-gray-400 text-sm">
            مبلغ: {amount.toLocaleString()} تومان
          </p>
          <p className="text-gray-500 text-xs mt-1">
            شناسه ثبت‌نام: {enrollmentId}
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
          <p className="text-blue-400 text-xs text-center">
            🔹 با کلیک روی دکمه زیر، به ربات بله هدایت می‌شوید
            <br />
            🔹 پس از پرداخت، به صورت خودکار به این صفحه بازمی‌گردید
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm mb-4">
            ❌ {error}
          </div>
        )}

        {paymentUrl && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl text-sm mb-4">
            ✅ لینک پرداخت ایجاد شد!
            <br />
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              باز کردن لینک پرداخت
            </a>
          </div>
        )}

        <GlassButton
          variant="primary"
          size="md"
          fullWidth
          loading={loading}
          disabled={loading || !!paymentUrl || !enrollmentId}
          onClick={handlePayment}
          icon={<Bot className="w-4 h-4" />}
          iconPosition="left"
        >
          {loading ? "در حال ایجاد لینک..." : "پرداخت از طریق بله"}
        </GlassButton>
      </LiquidGlassCard>
    </div>
  );
}
