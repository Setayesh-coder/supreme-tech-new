// src/lib/api/payment.ts
import api from "./axios";
import type {
  CardToCardPaymentRequest,
  BalePaymentRequest,
  BalePaymentResponse,
} from "../../types/cart";

export const paymentsAPI = {
  /**
   * 💳 ثبت رسید پرداخت کارت به کارت
   * POST /api/v1/payments/card-to-card
   */
  cardToCard: async (
    data: CardToCardPaymentRequest,
  ): Promise<{ message: string; status: string }> => {
    try {
      const token = localStorage.getItem("token") || "";

      const response = await api.post(
        "/payments/card-to-card",
        {
          enrollment_id: data.enrollment_id,
          tracking_code: data.tracking_code,
          receipt_image_url: data.receipt_image_url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در پرداخت کارت به کارت:", error);
      throw error;
    }
  },

  /**
   * 🤖 تولید لینک پرداخت ربات بله
   * POST /api/v1/payments/ble/initiate
   */
  baleInitiate: async (
    data: BalePaymentRequest,
  ): Promise<BalePaymentResponse> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.post("/payments/ble/initiate", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در پرداخت بله:", error);
      throw error;
    }
  },

  /**
   * 📊 استعلام اطلاعات فاکتور توسط ربات
   * GET /api/v1/payments/ble/checkout-info
   */
  baleCheckoutInfo: async (transactionId: string): Promise<any> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.get(
        `/payments/ble/checkout-info?transaction_id=${transactionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در استعلام بله:", error);
      throw error;
    }
  },

  /**
   * 📋 دریافت جزئیات پرداخت بر اساس enrollment
   * GET /api/v1/payments/enrollment/{enrollmentId}
   * این متد برای نمایش جزئیات پرداخت در مودال ادمین استفاده می‌شود
   */
  getPaymentByEnrollment: async (enrollmentId: string): Promise<any> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.get(`/payments/enrollment/${enrollmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در دریافت جزئیات پرداخت ${enrollmentId}:`, error);

      // اگر خطای 404 بود، یعنی پرداختی برای این enrollment وجود ندارد
      if (error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },
};
