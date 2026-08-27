// src/types/payment.ts
export interface CardToCardPaymentRequest {
  enrollment_id: string;
  tracking_code: string;
  receipt_image_url: string;
  amount?: number;
}

export interface BalePaymentRequest {
  enrollment_id: string;
  amount: number;
  description?: string;
}

export interface BalePaymentResponse {
  payment_link: string;
  transaction_id: string;
}

export interface PaymentRequest {
  enrollment_id: string;
  amount: number;
  payment_method: "card_to_card" | "bale";
}

export interface PaymentResponse {
  payment_link?: string;
  transaction_id?: string;
  status: "success" | "pending" | "failed";
  message: string;
}
