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
  refetch: () => Promise<void>;
  isCartValid: boolean;
  // ✅ اضافه کردن توابع جدید
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (enrollmentId: string) => Promise<void>;
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

  // ✅ تابع افزودن به سبد خرید
  const addToCart = useCallback(
    async (courseId: string) => {
      try {
        setLoading(true);
        setError(null);

        // 1. افزودن به سبد خرید
        await cartAPI.addToCart(courseId);
        console.log(`✅ دوره ${courseId} به سبد خرید اضافه شد`);

        // 2. دریافت مجدد سبد خرید
        await fetchCart();

        // 3. ارسال رویداد به‌روزرسانی
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cartUpdated"));
        }
      } catch (err: any) {
        console.error("❌ خطا در افزودن به سبد خرید:", err);
        setError(err.response?.data?.detail || "خطا در افزودن به سبد خرید");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCart],
  );

  // ✅ تابع حذف از سبد خرید
  const removeFromCart = useCallback(
    async (enrollmentId: string) => {
      try {
        setLoading(true);
        setError(null);

        // 1. حذف از سبد خرید
        await cartAPI.removeFromCart(enrollmentId);
        console.log(`✅ آیتم ${enrollmentId} از سبد خرید حذف شد`);

        // 2. دریافت مجدد سبد خرید
        await fetchCart();

        // 3. ارسال رویداد به‌روزرسانی
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cartUpdated"));
        }
      } catch (err: any) {
        console.error("❌ خطا در حذف از سبد خرید:", err);
        setError(err.response?.data?.detail || "خطا در حذف از سبد خرید");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCart],
  );

  // ✅ دریافت سبد خرید در فواصل زمانی منظم (Polling)
  useEffect(() => {
    let intervalId: number;

    if (typeof window !== "undefined") {
      fetchCart();

      intervalId = window.setInterval(() => {
        console.log("🔄 بررسی خودکار سبد خرید...");
        fetchCart();
      }, 30000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
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
    refetch: fetchCart,
    isCartValid,
    addToCart, // ✅ اضافه کردن
    removeFromCart, // ✅ اضافه کردن
  };
}
