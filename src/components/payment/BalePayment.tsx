// src/components/payment/BalePayment.tsx
import { useState } from "react";
import { GlassButton } from "../ui/GlassButton";
import { Send } from "lucide-react";

interface BalePaymentProps {
  enrollmentId: string;
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

export default function BalePayment({
  enrollmentId: _enrollmentId,
  amount,
  onSuccess,
  onBack,
}: BalePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayWithBale = async () => {
    setLoading(true);
    setError("");

    try {
      // TODO: ارسال به سرور برای پرداخت با بله
      // const result = await paymentsAPI.payWithBale(enrollmentId);
      // window.open(result.paymentUrl, "_blank");

      alert("✅ لینک پرداخت با ربات بله برای شما ارسال شد.");
      onSuccess();
    } catch (err) {
      setError("خطا در اتصال به ربات بله");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
        <Send className="w-12 h-12 text-green-400 mx-auto mb-2" />
        <p className="text-gray-300 text-sm">پرداخت از طریق ربات بله</p>
        <p className="text-white font-bold mt-2">
          مبلغ: {amount.toLocaleString()} تومان
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <GlassButton
          type="button"
          variant="white"
          size="md"
          onClick={onBack}
          className="flex-1"
        >
          بازگشت
        </GlassButton>
        <GlassButton
          type="button"
          variant="primary"
          size="md"
          loading={loading}
          disabled={loading}
          onClick={handlePayWithBale}
          className="flex-1"
        >
          {loading ? "در حال اتصال..." : "پرداخت با بله"}
        </GlassButton>
      </div>
    </div>
  );
}
