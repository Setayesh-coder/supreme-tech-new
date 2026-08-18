// src/components/profile/PaymentModal.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { Check, CreditCard } from "lucide-react";

interface PaymentModalProps {
  selectedEnrollment: any;
  saving: boolean;
  error: string;
  success: string;
  formatPrice: (price: number) => string;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentModal({
  selectedEnrollment,
  saving,
  error,
  success,
  formatPrice,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-300">
        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="24px"
          blurIntensity="xl"
          glowIntensity="lg"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-3">
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">تایید پرداخت</h2>
            <p className="text-gray-400 text-sm mt-1">
              برای ثبت‌نام در دوره، لطفاً پرداخت را تکمیل کنید
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm py-2 border-b border-white/10">
              <span className="text-gray-400">دوره</span>
              <span className="text-white font-medium">
                {selectedEnrollment.event.title}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-400">مبلغ قابل پرداخت</span>
              <span className="text-white font-bold text-lg">
                {formatPrice(selectedEnrollment.event.price)}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 text-sm text-center">
              <Check /> {success}
            </div>
          )}

          <div className="flex gap-3">
            <GlassButton
              variant="white"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              انصراف
            </GlassButton>
            <GlassButton
              variant="primary"
              size="md"
              className="flex-1"
              loading={saving}
              onClick={onConfirm}
            >
              پرداخت
            </GlassButton>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
