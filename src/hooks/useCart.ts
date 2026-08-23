// src/hooks/useCart.ts
import { useState, useEffect, useCallback } from "react";
import { cartAPI } from "../lib/api/cart";

interface CartItem {
  id: string;
  enrollment_id: string;
  course_id: string;
  event: {
    id: string;
    title: string;
    slug: string;
    date: string;
    price: number;
    image?: string;
  };
  paymentStatus?: string;
  status?: string;
  createdAt?: string;
}

interface UseCartReturn {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>; // ✅ تغییر به Promise<void>
  isCartValid: boolean;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartValid, setIsCartValid] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setCart([]);
        setIsCartValid(true);
        setLoading(false);
        return;
      }

      const cartData = await cartAPI.getCart();
      console.log("🛒 سبد خرید دریافت شد:", cartData);

      const items = cartData.items || [];

      const mappedCart = items.map((item: any) => ({
        id: item.enrollment_id || item.id,
        enrollment_id: item.enrollment_id || item.id,
        course_id: item.course_id,
        event: {
          id: item.course_id,
          title: item.course_title || "دوره آموزشی",
          slug: item.course_slug || "",
          date: item.created_at || new Date().toISOString(),
          price: item.discounted_price || item.original_price || 0,
          image: item.course_image || "",
        },
        paymentStatus: item.payment_status || item.paymentStatus || "PENDING",
        status: item.status || "PENDING",
        createdAt: item.created_at || new Date().toISOString(),
      }));

      setCart(mappedCart);
      setIsCartValid(true);

      // ✅ فقط state رو به‌روزرسانی کن، چیزی برنگردون
    } catch (err: any) {
      console.error("❌ خطا در دریافت سبد خرید:", err);

      if (
        err.response?.data?.detail?.includes("معتبر نیست") ||
        err.response?.data?.detail?.includes("منقضی شده") ||
        err.response?.status === 404
      ) {
        setIsCartValid(false);
        setCart([]);
        setError("سبد خرید شما منقضی شده است. سبد خرید جدید ایجاد شد.");
      } else {
        setError(err.response?.data?.detail || "خطا در دریافت سبد خرید");
        setIsCartValid(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ دریافت سبد خرید در فواصل زمانی منظم (Polling)
  useEffect(() => {
    let intervalId: number; // ✅ تغییر نوع به number

    if (typeof window !== "undefined") {
      // بارگذاری اولیه
      fetchCart();

      // هر 30 ثانیه یکبار بررسی کن
      intervalId = window.setInterval(() => {
        // ✅ استفاده از window.setInterval
        console.log("🔄 بررسی خودکار سبد خرید...");
        fetchCart();
      }, 30000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId); // ✅ استفاده از window.clearInterval
      }
    };
  }, [fetchCart]);

  // ✅ وقتی کاربر به صفحه برمی‌گردد (Focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ کاربر به صفحه برگشت، به‌روزرسانی سبد خرید...");
        fetchCart();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchCart]);

  // ✅ Event Listener برای به‌روزرسانی از سایر بخش‌ها
  useEffect(() => {
    const handleCartUpdated = () => {
      console.log("🛒 رویداد به‌روزرسانی سبد خرید دریافت شد");
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [fetchCart]);

  return {
    cart,
    loading,
    error,
    refetch: fetchCart, // ✅ fetchCart الان Promise<void> برمی‌گردونه
    isCartValid,
  };
}
