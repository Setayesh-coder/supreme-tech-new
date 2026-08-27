// src/components/Cart/CartItem.tsx
import React from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { Trash2, Calendar, Wallet, ShoppingCart } from "lucide-react";
import type { DisplayCartItem } from "../../types/cart";

interface CartItemProps {
  item: Partial<DisplayCartItem> & {
    id?: string;
    enrollment_id?: string;
    course_title?: string;
    final_price?: number;
  };
  onRemove: () => void;
  isRemoving: boolean;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item = {},
  onRemove,
  isRemoving,
}) => {
  const formatPrice = (price: any) => {
    // ✅ بررسی کامل
    if (price === undefined || price === null) return "۰ تومان";
    const numPrice = Number(price);
    if (isNaN(numPrice)) return "۰ تومان";
    if (numPrice === 0) return "رایگان";
    return `${numPrice.toLocaleString("fa-IR")} تومان`;
  };

  // ✅ استخراج با مقدار پیش‌فرض
  const title = item?.title || item?.course_title || "دوره آموزشی";
  const price = item?.price ?? item?.final_price ?? 0;
  const originalPrice = item?.original_price ?? 0;
  const discount = item?.discount ?? Math.max(0, originalPrice - price);
  const image = item?.image || "";
  const date = item?.date || new Date().toISOString();
  //   const id = item?.id || item?.enrollment_id || "";

  return (
    <LiquidGlassCard
      className="p-4 hover:bg-white/5 transition-all duration-300"
      borderRadius="14px"
      blurIntensity="sm"
      glowIntensity="sm"
    >
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* تصویر */}
        <div className="w-full md:w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white/20" />
            </div>
          )}
        </div>

        {/* اطلاعات */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">{title}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date ? new Date(date).toLocaleDateString("fa-IR") : "نامشخص"}
            </span>
            <span className="flex items-center gap-1 text-blue-400 font-medium">
              <Wallet className="w-3 h-3" />
              {formatPrice(price)}
            </span>
            {discount > 0 && (
              <span className="text-green-400 text-xs">
                {formatPrice(discount)} تخفیف
              </span>
            )}
          </div>
        </div>

        {/* دکمه حذف */}
        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all duration-300 w-full md:w-auto disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </LiquidGlassCard>
  );
};

export default CartItemComponent;
