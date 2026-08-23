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
    discount_value?: number;
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
  max_discount_amount: number;
  min_order_amount: number;
  max_uses_per_user: number;
  allowed_courses: string;
  allowed_phones: string;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

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

export interface Order {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  total_original_price: number;
  total_discount: number;
  total_payable: number;
  status: "pending" | "waiting_for_approval" | "paid" | "failed" | "cancelled";
  payment_method: "card_to_card" | "bale";
  tracking_code?: string;
  receipt_image_url?: string;
  transaction_id?: string;
  enrollments: {
    id: string;
    course_id: string;
    course_title: string;
    status: string;
  }[];
  created_at: string;
  updated_at: string;
}
