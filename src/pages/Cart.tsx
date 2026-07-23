// src/pages/Cart.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enrollmentsAPI } from "../lib/api/enrollments";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";
import { CreditCard, ShoppingCart, Loader2 } from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await enrollmentsAPI.getMyEnrollments();
      const pending = data.filter((e: any) => e.paymentStatus === "PENDING");
      setCart(pending);
    } catch (err) {
      console.error("خطا:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (enrollmentId: string) => {
    setProcessing(true);
    try {
      await enrollmentsAPI.processPayment(enrollmentId);
      alert("✅ پرداخت با موفقیت انجام شد!");
      fetchCart();
    } catch (err) {
      alert("خطا در پرداخت");
    } finally {
      setProcessing(false);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.event.price, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-12 px-4 min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <ShoppingCart size={28} />
          سبد خرید
        </h1>

        {cart.length === 0 ? (
          <LiquidGlassCard className="p-12 text-center" borderRadius="24px">
            <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">سبد خرید شما خالی است</p>
            <GlassButton className="mt-4" onClick={() => navigate("/events")}>
              مشاهده رویدادها
            </GlassButton>
          </LiquidGlassCard>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <LiquidGlassCard
                key={item.id}
                className="p-4"
                borderRadius="16px"
              >
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {item.event.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(item.event.date).toLocaleDateString("fa-IR")}
                    </p>
                    <p className="text-blue-400 font-bold">
                      {item.event.price.toLocaleString()} تومان
                    </p>
                  </div>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    loading={processing}
                    icon={<CreditCard size={16} />}
                    iconPosition="left"
                    onClick={() => handlePayment(item.id)}
                  >
                    پرداخت
                  </GlassButton>
                </div>
              </LiquidGlassCard>
            ))}

            <LiquidGlassCard className="p-4" borderRadius="16px">
              <div className="flex justify-between items-center">
                <span className="text-white text-lg">مجموع:</span>
                <span className="text-white text-2xl font-bold">
                  {totalPrice.toLocaleString()} تومان
                </span>
              </div>
              <GlassButton
                variant="primary"
                size="lg"
                fullWidth
                className="mt-4"
                loading={processing}
                onClick={() => {
                  cart.forEach((item) => handlePayment(item.id));
                }}
              >
                پرداخت همه
              </GlassButton>
            </LiquidGlassCard>
          </div>
        )}
      </div>
    </section>
  );
}
