// src/lib/api/coupons.ts
import api from "./axios";
import type { Coupon } from "../../types/cart";

export const couponsAPI = {
  /**
   * 📋 دریافت لیست کدهای تخفیف (فقط ادمین)
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<{
    items: Coupon[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/admin/coupons", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * ➕ ایجاد کد تخفیف جدید (فقط ادمین)
   */
  create: async (data: {
    code: string;
    description?: string;
    discount_type: "PERCENT" | "FIXED";
    discount_value: number;
    max_uses: number;
    expires_at: string;
  }): Promise<Coupon> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/admin/coupons", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * ✏️ ویرایش وضعیت کد تخفیف (فقط ادمین)
   */
  updateStatus: async (
    couponId: string,
    isActive: boolean,
  ): Promise<Coupon> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(
      `/admin/coupons/${couponId}`,
      { is_active: isActive },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};
