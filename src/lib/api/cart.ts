// src/lib/api/cart.ts
import api from "./axios";
import type {
  Cart,
  ApplyCouponRequest,
  RemoveCouponRequest,
} from "../../types/cart";

export const cartAPI = {
  /**
   * 🛒 مشاهده سبد خرید
   */
  getCart: async (): Promise<Cart> => {
    const token = localStorage.getItem("token") || "";

    // ✅ اگر توکن وجود ندارد، خطا بده
    if (!token) {
      throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
    }

    const response = await api.get("/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
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
