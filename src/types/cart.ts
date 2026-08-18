// src/types/cart.ts

export interface CartItem {
  id: string;
  course_id: string;
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
    cover_image?: string;
    instructor_name?: string;
  };
  enrollment_id: string;
  price: number;
  created_at: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discount: number;
  final_total: number;
  coupon?: {
    code: string;
    discount_amount: number;
    type: "PERCENT" | "FIXED";
  };
}

export interface ApplyCouponRequest {
  code: string;
}

export interface RemoveCouponRequest {
  code: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface CardToCardPaymentRequest {
  enrollment_id: string;
  tracking_code: string;
  receipt_image: File;
}

export interface BalePaymentRequest {
  enrollment_id: string;
  amount: number;
  description?: string;
}

export interface BalePaymentResponse {
  payment_url: string;
  transaction_id: string;
}
