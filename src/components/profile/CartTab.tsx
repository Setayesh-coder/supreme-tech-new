// src/components/profile/CartTab.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import {
  ShoppingCart,
  Calendar,
  Wallet,
  CreditCard,
  Trash2,
  Zap,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface CartTabProps {
  cart: any[];
  processing: boolean;
  processingId: string | null;
  totalCartPrice: number;
  isCartFree: boolean;
  handleCartPayment: (id: string) => void;
  handleRemoveFromCart: (id: string) => void;
  handlePayAll: () => void;
  formatPrice: (price: number) => string;
  navigate: (path: string) => void;
}

export function CartTab({
  cart,
  processing,
  processingId,
  totalCartPrice,
  isCartFree,
  handleCartPayment,
  handleRemoveFromCart,
  handlePayAll,
  formatPrice,
  navigate,
}: CartTabProps) {
  if (cart.length === 0) {
    return (
      <LiquidGlassCard
        className="p-8 text-center"
        borderRadius="20px"
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
            هیچ دوره‌ای برای پرداخت در سبد خرید نیست
          </p>
          <GlassButton variant="primary" onClick={() => navigate("/events")}>
            مشاهده رویدادها
          </GlassButton>
        </div>
      </LiquidGlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <LiquidGlassCard
        className="p-6"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
          <ShoppingCart className="w-5 h-5 text-orange-400" />
          سبد خرید
          <span className="text-sm text-gray-400 font-normal mr-2">
            ({cart.length} دوره)
          </span>
        </h2>

        <div className="space-y-3">
          {cart.map((item) => {
            const isProcessing = processingId === item.id;

            return (
              <LiquidGlassCard
                key={item.id}
                className="p-4 hover:bg-white/5 transition-all duration-300"
                borderRadius="14px"
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
                        {new Date(item.event.date).toLocaleDateString("fa-IR")}
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
                      onClick={() => handleCartPayment(item.id)}
                      className="flex-1 md:flex-none"
                    >
                      پرداخت
                    </GlassButton>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
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
      </LiquidGlassCard>

      <LiquidGlassCard
        className="p-6"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">تعداد دوره‌ها</p>
            <p className="text-xl font-bold text-white">{cart.length} دوره</p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">مبلغ قابل پرداخت</p>
            <p className="text-3xl font-bold text-white">
              {formatPrice(totalCartPrice)}
            </p>
            {isCartFree && (
              <p className="text-xs text-green-400 mt-1">
                همه دوره‌ها رایگان هستند
              </p>
            )}
          </div>

          <GlassButton
            variant="primary"
            size="lg"
            loading={processing}
            disabled={processing || cart.length === 0}
            icon={
              isCartFree ? (
                <Zap className="w-5 h-5" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )
            }
            iconPosition="left"
            onClick={handlePayAll}
            className="w-full md:w-auto"
          >
            {isCartFree ? "تایید و ثبت‌نام رایگان" : "پرداخت همه"}
          </GlassButton>
        </div>

        {!isCartFree && cart.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            با پرداخت همه، تمام دوره‌های سبد خرید ثبت‌نام می‌شوند
          </div>
        )}
      </LiquidGlassCard>

      <div className="text-center">
        <button
          onClick={() => navigate("/events")}
          className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-1 mx-auto"
        >
          <ArrowRight className="w-4 h-4" />
          ادامه مشاهده رویدادها
        </button>
      </div>
    </div>
  );
}
