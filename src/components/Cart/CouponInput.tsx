// src/components/Cart/CouponInput.tsx
import React, { useState } from "react";
import { Gift, Ticket, X, Percent, CheckCircle } from "lucide-react";
import { GlassButton } from "../ui/GlassButton";

interface CouponInputProps {
  onApply: (code: string) => void; // ✅ تغییر به string
  onRemove: () => void; // ✅ بدون پارامتر
  isApplying: boolean;
  currentCoupon?: string;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  onApply,
  onRemove,
  isApplying,
  currentCoupon,
}) => {
  const [couponCode, setCouponCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      onApply(couponCode.trim().toUpperCase());
      setCouponCode("");
    }
  };

  if (currentCoupon) {
    return (
      <div className="mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
            <Gift className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-white">کد تخفیف</h3>
          <span className="mr-auto text-xs text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            اعمال شده
          </span>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-4">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Percent className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold font-mono text-lg">
                    {currentCoupon}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  کد تخفیف اعمال شده
                </p>
              </div>
            </div>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
              title="حذف کد تخفیف"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 pb-4 border-b border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
          <Gift className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="text-sm font-medium text-white">کد تخفیف</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
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
            disabled={isApplying}
          />
        </div>
        <GlassButton
          variant="primary"
          size="sm"
          loading={isApplying}
          type="submit"
          disabled={isApplying || !couponCode.trim()}
          className="sm:w-auto w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {isApplying ? "در حال بررسی..." : "اعمال کد"}
        </GlassButton>
      </form>
    </div>
  );
};
