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
   * 📋 دریافت سبد خرید
   * GET /api/v1/cart
   */
  getCart: async (): Promise<Cart> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { items: [], total: 0, discount: 0, final_total: 0 };
      }

      const response = await api.get("/cart/");
      console.log("🛒 سبد خرید دریافت شد:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در دریافت سبد خرید:", error);
      return { items: [], total: 0, discount: 0, final_total: 0 };
    }
  },

  /**
   * ➕ اضافه کردن به سبد خرید
   * POST /api/v1/cart
   */
  addToCart: async (courseId: string): Promise<Cart> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      console.log(`📤 اضافه کردن دوره ${courseId} به سبد خرید...`);

      const response = await api.post(
        "/cart/",
        { course_id: courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("✅ دوره به سبد خرید اضافه شد");
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در افزودن به سبد خرید:`, error);
      throw error;
    }
  },

  /**
   * 🗑️ حذف آیتم از سبد خرید
   * DELETE /api/v1/cart/{id}
   */
  removeFromCart: async (id: string): Promise<{ message: string }> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      console.log(`📤 حذف آیتم ${id} از سبد خرید...`);

      const response = await api.delete(`/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ آیتم از سبد خرید حذف شد");
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در حذف از سبد خرید ${id}:`, error);
      throw error;
    }
  },

  /**
   * 🎫 اعمال کد تخفیف
   * POST /api/v1/cart/apply-coupon
   */
  applyCoupon: async (data: ApplyCouponRequest): Promise<Cart> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      console.log(`📤 اعمال کد تخفیف: ${data.code}`);

      const response = await api.post("/cart/apply-coupon", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ کد تخفیف اعمال شد");
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      console.log(`📤 حذف کد تخفیف: ${data.code}`);

      const response = await api.delete("/cart/remove-coupon", {
        data,
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ کد تخفیف حذف شد");
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در حذف کد تخفیف:", error);
      throw error;
    }
  },

  /**
   * 🧹 خالی کردن سبد خرید
   * DELETE /api/v1/cart
   */
  clearCart: async (): Promise<{ message: string }> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      console.log("📤 خالی کردن سبد خرید...");

      const response = await api.delete("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ سبد خرید خالی شد");
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در خالی کردن سبد خرید:", error);
      throw error;
    }
  },

  /**
   * 📊 دریافت خلاصه سبد خرید
   * GET /api/v1/cart/summary
   */
  getCartSummary: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { total: 0, discount: 0, final_total: 0 };
      }

      const response = await api.get("/cart/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در دریافت خلاصه سبد خرید:", error);
      return { total: 0, discount: 0, final_total: 0 };
    }
  },

  /**
   * ℹ️ دریافت اطلاعات کد تخفیف اعمال شده
   * GET /api/v1/cart/coupon-info
   */
  getCouponInfo: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }

      const response = await api.get("/cart/coupon-info", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در دریافت اطلاعات تخفیف:", error);
      return null;
    }
  },
};
