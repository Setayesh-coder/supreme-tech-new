// src/lib/api/coupons.ts
import api from "./axios";
import type { Coupon } from "../../types/cart";

export const couponsAPI = {
  /**
   * 📋 لیست تمام کدهای تخفیف (فقط ادمین)
   * GET /api/v1/admin/coupons/
   */
  getAll: async (params?: {
    search?: string;
    is_active?: boolean;
  }): Promise<{ items: Coupon[]; total: number }> => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      const response = await api.get("/admin/coupons/", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        return { items: response.data, total: response.data.length };
      }

      if (response.data && response.data.items) {
        return response.data;
      }

      return { items: [], total: 0 };
    } catch (error: any) {
      console.error("❌ خطا در دریافت کدهای تخفیف:", error);
      throw error;
    }
  },

  /**
   * ➕ ساخت کد تخفیف جدید (فقط ادمین)
   * POST /api/v1/admin/coupons/
   */
  create: async (data: {
    code: string;
    discount_type: "PERCENT" | "FIXED";
    discount_value: number;
    description?: string;
    max_uses?: number;
    expires_at?: string;
  }): Promise<Coupon> => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      // ✅ تبدیل به فرمت مورد انتظار بک‌اند
      const discountTypeMap = {
        PERCENT: "percentage",
        FIXED: "fixed_amount",
      };

      const payload = {
        code: data.code.toUpperCase(),
        discount_type: discountTypeMap[data.discount_type] || "percentage",
        discount_value: Number(data.discount_value),
        description: data.description || "",
        max_uses: Number(data.max_uses) || 1,
        expires_at:
          data.expires_at ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await api.post("/admin/coupons/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در ایجاد کد تخفیف:", error);

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          const messages = detail.map((d: any) => d.msg).join(", ");
          throw new Error(messages);
        }
        throw new Error(detail);
      }
      throw error;
    }
  },

  /**
   * ✏️ تغییر وضعیت کد تخفیف (فقط ادمین)
   * ✅ is_active در query params
   * PATCH /api/v1/admin/coupons/{coupon_id}?is_active={true|false}
   */
  updateStatus: async (
    couponId: string,
    isActive: boolean,
  ): Promise<Coupon> => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      // ✅ is_active به عنوان query param
      const response = await api.patch(
        `/admin/coupons/${couponId}?is_active=${isActive}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در بروزرسانی کد تخفیف ${couponId}:`, error);
      throw error;
    }
  },

  /**
   * 🗑️ حذف/غیرفعال کردن کد تخفیف (فقط ادمین)
   * ✅ is_active در query params با false
   * PATCH /api/v1/admin/coupons/{coupon_id}?is_active=false
   */
  delete: async (couponId: string): Promise<{ message: string }> => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      }

      // ✅ is_active به عنوان query param با false
      await api.patch(
        `/admin/coupons/${couponId}?is_active=false`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return { message: "کد تخفیف با موفقیت غیرفعال شد" };
    } catch (error: any) {
      console.error(`❌ خطا در غیرفعال کردن کد تخفیف ${couponId}:`, error);
      throw error;
    }
  },
};
