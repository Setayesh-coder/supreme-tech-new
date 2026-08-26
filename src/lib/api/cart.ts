// lib/api/cart.ts
import api from "./axios";
import type {
  CartResponse,
  ApplyCouponRequest,
  RemoveCouponRequest,
  PaymentRequest,
  PaymentResponse,
} from "../../types/cart";

// ✅ تابع کمک برای نرمال‌سازی داده‌ها
export const normalizeCartItem = (item: any): CartResponse["items"][0] => ({
  id: item.id || item.enrollment_id,
  enrollment_id: item.enrollment_id || item.id,
  course_id: item.course_id,
  course_title: item.course_title || "دوره آموزشی",
  original_price: Number(item.original_price) || 0,
  discounted_price: Number(item.discounted_price) || 0,
  applied_price: Number(item.applied_price) || 0,
  final_price: Number(item.final_price) || 0,
  quantity: item.quantity || 1,
  course: {
    id: item.course_id,
    title: item.course_title || "دوره آموزشی",
    slug: item.course_slug || "",
    price: Number(item.discounted_price) || Number(item.original_price) || 0,
    cover_image: item.course_image || "",
    instructor_name: item.instructor_name || "",
  },
  created_at: item.created_at || new Date().toISOString(),
});

// ✅ API Service کامل
export const cartAPI = {
  /**
   * 📋 دریافت سبد خرید
   */
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await api.get("/cart/");
      console.log("🛒 سبد خرید دریافت شد:", response.data);

      // نرمال‌سازی داده‌ها
      const items = (response.data.items || []).map(normalizeCartItem);
      const summary = response.data.summary || {
        total_original_price: 0,
        total_courses_discount: 0,
        total_payable: 0,
      };

      return {
        items,
        summary: {
          total_original_price: Number(summary.total_original_price) || 0,
          total_courses_discount: Number(summary.total_courses_discount) || 0,
          coupon_code: summary.coupon_code,
          coupon_discount: Number(summary.coupon_discount) || 0,
          total_payable: Number(summary.total_payable) || 0,
        },
      };
    } catch (error: any) {
      console.error("❌ خطا در دریافت سبد خرید:", error);

      // اگر کاربر لاگین نباشه، سبد خرید خالی برگردون
      if (error.response?.status === 401) {
        return {
          items: [],
          summary: {
            total_original_price: 0,
            total_courses_discount: 0,
            total_payable: 0,
          },
        };
      }

      throw error;
    }
  },

  /**
   * ➕ اضافه کردن به سبد خرید
   */
  addToCart: async (courseId: string): Promise<CartResponse> => {
    console.log(`📤 اضافه کردن دوره ${courseId} به سبد خرید...`);
    const response = await api.post("/cart/", { course_id: courseId });
    console.log("✅ دوره به سبد خرید اضافه شد");

    // نرمال‌سازی پاسخ
    const items = (response.data.items || []).map(normalizeCartItem);
    return {
      ...response.data,
      items,
    };
  },

  /**
   * 🗑️ حذف آیتم از سبد خرید
   */
  removeFromCart: async (id: string): Promise<{ message: string }> => {
    console.log(`📤 حذف آیتم ${id} از سبد خرید...`);
    const response = await api.delete(`/cart/${id}`);
    console.log("✅ آیتم از سبد خرید حذف شد");
    return response.data;
  },

  /**
   * 🎫 اعمال کد تخفیف
   */
  applyCoupon: async (data: ApplyCouponRequest): Promise<CartResponse> => {
    console.log(`📤 اعمال کد تخفیف: ${data.code}`);
    const response = await api.post("/cart/apply-coupon", data);
    console.log("✅ کد تخفیف اعمال شد");

    const items = (response.data.items || []).map(normalizeCartItem);
    return {
      ...response.data,
      items,
    };
  },

  /**
   * ❌ حذف کد تخفیف
   */
  removeCoupon: async (data: RemoveCouponRequest): Promise<CartResponse> => {
    console.log(`📤 حذف کد تخفیف: ${data.code}`);
    const response = await api.delete("/cart/remove-coupon", { data });
    console.log("✅ کد تخفیف حذف شد");

    const items = (response.data.items || []).map(normalizeCartItem);
    return {
      ...response.data,
      items,
    };
  },

  /**
   * 🧹 خالی کردن سبد خرید
   */
  clearCart: async (): Promise<{ message: string }> => {
    console.log("📤 خالی کردن سبد خرید...");
    const response = await api.delete("/cart/");
    console.log("✅ سبد خرید خالی شد");
    return response.data;
  },

  /**
   * 💳 پرداخت
   */
  checkout: async (data: PaymentRequest): Promise<PaymentResponse> => {
    console.log(`📤 پرداخت ${data.amount} تومان...`);
    const response = await api.post("/cart/checkout", data);
    console.log("✅ پرداخت با موفقیت انجام شد");
    return response.data;
  },
};
