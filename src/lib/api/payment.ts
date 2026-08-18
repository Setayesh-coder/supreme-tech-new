// src/lib/api/payments.ts
import api from "./axios";
import type {
  CardToCardPaymentRequest,
  BalePaymentRequest,
  BalePaymentResponse,
} from "../../types/cart";

export const paymentsAPI = {
  /**
   * 💳 ثبت رسید پرداخت کارت به کارت
   */
  cardToCard: async (
    data: CardToCardPaymentRequest,
  ): Promise<{ message: string; status: string }> => {
    const token = localStorage.getItem("token") || "";
    const formData = new FormData();
    formData.append("enrollment_id", data.enrollment_id);
    formData.append("tracking_code", data.tracking_code);
    formData.append("receipt_image", data.receipt_image);

    const response = await api.post("/payments/card-to-card", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * 🤖 تولید لینک پرداخت ربات بله
   */
  baleInitiate: async (
    data: BalePaymentRequest,
  ): Promise<BalePaymentResponse> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/payments/ble/initiate", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * 📊 استعلام اطلاعات فاکتور توسط ربات
   */
  baleCheckoutInfo: async (transactionId: string): Promise<any> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(
      `/payments/ble/checkout-info?transaction_id=${transactionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};
