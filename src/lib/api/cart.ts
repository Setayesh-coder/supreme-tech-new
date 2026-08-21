// src/lib/api/cart.ts
import api from "./axios";
import type {
  Cart,
  ApplyCouponRequest,
  RemoveCouponRequest,
} from "../../types/cart";

export interface CartItem {
  id: string;
  course_id: string;
  event_id?: string;
  status: "PENDING";
  payment_status: "PENDING";
  event?: {
    id: string;
    title: string;
    slug: string;
    date: string;
    price: number;
    image?: string;
  };
  course?: {
    id: string;
    title: string;
    slug: string;
    price: number;
    cover_image?: string;
  };
  created_at: string;
}

export const cartAPI = {
  /**
   * 📋 دریافت سبد خرید (آیتم‌های در انتظار پرداخت)
   * GET /api/cart
   */

  getCart: async (): Promise<any> => {
    try {
      const response = await api.get("/cart/");
      return response.data; // این می‌تواند آرایه یا آبجکت باشد
    } catch (error: any) {
      console.error("❌ خطا در دریافت سبد خرید:", error);
      return []; // یا { items: [] }
    }
  },

  /**
   * 🎫 اعمال کد تخفیف
   */
  applyCoupon: async (data: ApplyCouponRequest): Promise<Cart> => {
    const token = localStorage.getItem("token") || "";

    if (!token) {
      throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
    }

    const response = await api.post("/cart/apply-coupon", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * ❌ حذف کد تخفیف
   */
  removeCoupon: async (data: RemoveCouponRequest): Promise<Cart> => {
    const token = localStorage.getItem("token") || "";

    if (!token) {
      throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
    }

    const response = await api.delete("/cart/remove-coupon", {
      data,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
