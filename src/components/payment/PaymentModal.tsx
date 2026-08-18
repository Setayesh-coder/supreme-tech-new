// src/components/payment/PaymentModal.tsx
import { useState } from "react";
import { X, CreditCard, Bot, ArrowRight } from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import CardToCardPayment from "./CardToCardPayment";
import BalePayment from "./BalePayment";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  amount: number;
  courseTitle: string;
  onSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  enrollmentId,
  amount,
  courseTitle,
  onSuccess,
}: PaymentModalProps) {
  const [method, setMethod] = useState<"CARD_TO_CARD" | "BALE" | null>(null);
  const [step, setStep] = useState<"SELECT" | "PAYMENT">("SELECT");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<{
    amount: number;
    finalAmount: number;
  } | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  if (!isOpen) return null;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    try {
      // TODO: فراخوانی API اعتبارسنجی کد تخفیف
      // const result = await discountsAPI.validate(discountCode, amount);
      // setDiscountApplied(result);

      // ✅ نمونه موقت
      setDiscountApplied({
        amount: amount * 0.1,
        finalAmount: amount * 0.9,
      });
    } catch (error) {
      alert("کد تخفیف نامعتبر است");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleSelectMethod = (selectedMethod: "CARD_TO_CARD" | "BALE") => {
    setMethod(selectedMethod);
    setStep("PAYMENT");
  };

  const handleBack = () => {
    setStep("SELECT");
    setMethod(null);
  };

  const finalAmount = discountApplied?.finalAmount || amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <LiquidGlassCard
          className="p-6 md:p-8 relative"
          borderRadius="24px"
          blurIntensity="xl"
          glowIntensity="lg"
          shadowIntensity="lg"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              <CreditCard /> پرداخت
            </h2>
            <p className="text-gray-400 text-sm mt-1">{courseTitle}</p>
            <p className="text-2xl font-bold text-blue-400 mt-2">
              {finalAmount.toLocaleString()} تومان
            </p>
          </div>

          {/* کد تخفیف */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="کد تخفیف"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
                disabled={!!discountApplied || applyingDiscount}
              />
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleApplyDiscount}
                loading={applyingDiscount}
                disabled={!discountCode.trim() || !!discountApplied}
              >
                اعمال
              </GlassButton>
            </div>
            {discountApplied && (
              <p className="text-green-400 text-sm mt-1">
                ✅ تخفیف اعمال شد: {discountApplied.amount.toLocaleString()}{" "}
                تومان
                <br />
                مبلغ قابل پرداخت: {discountApplied.finalAmount.toLocaleString()}{" "}
                تومان
              </p>
            )}
          </div>

          {step === "SELECT" ? (
            <div className="space-y-3">
              <button
                onClick={() => handleSelectMethod("CARD_TO_CARD")}
                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right flex-1">
                  <p className="text-white font-medium">کارت به کارت</p>
                  <p className="text-gray-400 text-sm">پرداخت با کارت بانکی</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                onClick={() => handleSelectMethod("BALE")}
                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-right flex-1">
                  <p className="text-white font-medium">ربات بله</p>
                  <p className="text-gray-400 text-sm">
                    پرداخت از طریق ربات بله
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : (
            <div>
              {method === "CARD_TO_CARD" && (
                <CardToCardPayment
                  enrollmentId={enrollmentId}
                  amount={finalAmount}
                  onSuccess={onSuccess}
                  onBack={handleBack}
                />
              )}
              {method === "BALE" && (
                <BalePayment
                  enrollmentId={enrollmentId}
                  amount={finalAmount}
                  onSuccess={onSuccess}
                  onBack={handleBack}
                />
              )}
            </div>
          )}
        </LiquidGlassCard>
      </div>
    </div>
  );
}
