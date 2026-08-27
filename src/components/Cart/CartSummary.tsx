// src/components/Cart/CartSummary.tsx
import React from "react";
import { GlassButton } from "../ui/GlassButton";
import { CreditCard, Zap } from "lucide-react";

interface CartSummaryProps {
  totalOriginalPrice: number;
  totalDiscount: number;
  couponDiscount: number;
  totalPrice: number;
  totalItems: number;
  onCheckout: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  totalOriginalPrice,
  totalDiscount,
  couponDiscount,
  totalPrice,
  totalItems,
  onCheckout,
}) => {
  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  const isFree = totalPrice === 0 && totalItems > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-gray-400">
          <span>جمع کل</span>
          <span>{formatPrice(totalOriginalPrice)}</span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>تخفیف دوره‌ها</span>
            <span>- {formatPrice(totalDiscount)}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-purple-400">
            <span>تخفیف کد</span>
            <span>- {formatPrice(couponDiscount)}</span>
          </div>
        )}

        <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-lg">
          <span>مبلغ قابل پرداخت</span>
          <span className="text-blue-400">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="text-center sm:text-right">
          <p className="text-sm text-gray-400">تعداد دوره‌ها</p>
          <p className="text-xl font-bold text-white">{totalItems} دوره</p>
        </div>

        <GlassButton
          variant="primary"
          size="lg"
          onClick={onCheckout}
          icon={
            isFree ? (
              <Zap className="w-5 h-5" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )
          }
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isFree ? "ثبت‌نام رایگان" : "انتخاب روش پرداخت"}
        </GlassButton>
      </div>
    </div>
  );
};
