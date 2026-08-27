// src/lib/api/payment.ts
import api from "./axios";
import type { Order } from "../../types/cart";

export const paymentsAPI = {
  /**
   * 💳 ثبت رسید پرداخت کارت به کارت
   */
  cardToCardPayment: async (data: {
    enrollment_id: string;
    tracking_code: string;
    receipt_image_url: string;
    amount?: number;
  }) => {
    try {
      const response = await api.post("/payments/card-to-card", data);
      console.log("✅ رسید کارت به کارت ثبت شد:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در ثبت رسید کارت به کارت:", error);
      throw error;
    }
  },

  /**
   * 🤖 تولید لینک پرداخت ربات بله
   */
  balePayment: async (data: {
    enrollment_id: string;
    amount: number;
    description?: string;
  }) => {
    try {
      const response = await api.post("/payments/ble/initiate", data);
      console.log("✅ لینک پرداخت بله تولید شد:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در تولید لینک پرداخت بله:", error);
      throw error;
    }
  },

  /**
   * 📋 دریافت تمامی سفارشات (ادمین)
   */
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get("/payments/orders");
      console.log("📋 سفارشات دریافت شد:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در دریافت سفارشات:", error);
      throw error;
    }
  },

  /**
   * ✅ تایید یا رد سفارش (ادمین)
   */
  verifyOrder: async (orderId: string, approved: boolean): Promise<any> => {
    try {
      const response = await api.patch(`/payments/orders/${orderId}/verify`, {
        approved,
      });
      console.log(
        `✅ سفارش ${orderId} ${approved ? "تایید" : "رد"} شد:`,
        response.data,
      );
      return response.data;
    } catch (error) {
      console.error(`❌ خطا در تایید/رد سفارش ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * 💳 دریافت جزئیات پرداخت بر اساس enrollment_id
   */
  getPaymentByEnrollment: async (enrollmentId: string): Promise<any> => {
    try {
      const response = await api.get(`/payments/enrollment/${enrollmentId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ خطا در دریافت جزئیات پرداخت ${enrollmentId}:`, error);
      throw error;
    }
  },
};
