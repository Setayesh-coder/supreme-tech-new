// src/components/payment/PaymentMethodModal.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { X, CreditCard, Bot, ArrowRight, Wallet, Zap } from "lucide-react";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSelectBale: () => void;
  onSelectCardToCard: () => void;
  isFree?: boolean;
}

export function PaymentMethodModal({
  isOpen,
  onClose,
  amount,
  onSelectBale,
  onSelectCardToCard,
  isFree = false,
}: PaymentMethodModalProps) {
  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">انتخاب روش پرداخت</h2>
            <p className="text-gray-400 text-sm mt-1">
              مبلغ قابل پرداخت: {formatPrice(amount)}
            </p>
            {isFree && (
              <p className="text-green-400 text-sm mt-1 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" />
                تمام دوره‌ها رایگان هستند
              </p>
            )}
          </div>

          <div className="space-y-3">
            {!isFree && (
              <button
                onClick={onSelectBale}
                className="w-full p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all duration-300 flex items-center gap-4 group text-right"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                    پرداخت از طریق بله
                  </h3>
                  <p className="text-gray-400 text-xs">
                    پرداخت خودکار و سریع از طریق ربات بله
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
              </button>
            )}

            {!isFree && (
              <button
                onClick={onSelectCardToCard}
                className="w-full p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all duration-300 flex items-center gap-4 group text-right"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                    پرداخت کارت به کارت
                  </h3>
                  <p className="text-gray-400 text-xs">
                    واریز به شماره کارت و ارسال رسید
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </button>
            )}

            {isFree && (
              <button
                onClick={onSelectCardToCard}
                className="w-full p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl transition-all duration-300 flex items-center gap-4 group text-right"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                    ثبت‌نام رایگان
                  </h3>
                  <p className="text-gray-400 text-xs">
                    تمام دوره‌های سبد خرید رایگان هستند
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
              </button>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
              تمامی پرداخت‌ها با امنیت بالا انجام می‌شود
            </p>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
