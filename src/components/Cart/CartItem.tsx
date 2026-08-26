// src/components/Cart/CartItem.tsx
import React from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { Trash2, Calendar, Wallet, ShoppingCart } from "lucide-react";
import type { DisplayCartItem } from "../../types/cart";

interface CartItemProps {
  item: DisplayCartItem;
  onRemove: () => void;
  isRemoving: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onRemove,
  isRemoving,
}) => {
  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  return (
    <LiquidGlassCard
      className="p-4 hover:bg-white/5 transition-all duration-300"
      borderRadius="14px"
      blurIntensity="sm"
      glowIntensity="sm"
    >
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Image */}
        <div className="w-full md:w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white/20" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">
            {item.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString("fa-IR")}
            </span>
            <span className="flex items-center gap-1 text-blue-400 font-medium">
              <Wallet className="w-3 h-3" />
              {formatPrice(item.price)}
            </span>
            {item.discount > 0 && (
              <span className="text-green-400 text-xs">
                {formatPrice(item.discount)} تخفیف
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
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
