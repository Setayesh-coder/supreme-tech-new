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
   * GET /api/v1/cart/
   */
  getCart: async (): Promise<Cart> => {
    try {
      const response = await api.get("/cart/");
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در دریافت سبد خرید:", error);
      // برگرداندن ساختار خالی با فرمت صحیح
      return { items: [], total: 0, discount: 0, final_total: 0 };
    }
  },

  /**
   * 🎫 اعمال کد تخفیف
   * POST /api/v1/cart/apply-coupon
   */
  applyCoupon: async (data: ApplyCouponRequest): Promise<Cart> => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      const response = await api.post("/cart/apply-coupon", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در اعمال کد تخفیف:", error);
      throw error;
    }
  },

  /**
   * ❌ حذف کد تخفیف
   * DELETE /api/v1/cart/remove-coupon
   */
  removeCoupon: async (data: RemoveCouponRequest): Promise<Cart> => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      const response = await api.delete("/cart/remove-coupon", {
        data,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در حذف کد تخفیف:", error);
      throw error;
    }
  },

  /**
   * 🗑️ حذف آیتم از سبد خرید
   * DELETE /api/v1/cart/{id}
   */
  removeFromCart: async (id: string): Promise<{ message: string }> => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      const response = await api.delete(`/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در حذف از سبد خرید ${id}:`, error);
      throw error;
    }
  },
};
