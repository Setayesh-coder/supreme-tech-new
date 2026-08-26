// types/cart.ts

// ✅ تایپ اصلی آیتم سبد خرید
export interface CartItem {
  id: string;
  enrollment_id: string;
  course_id: string;
  course_title: string;
  original_price: number;
  discounted_price: number;
  applied_price: number;
  final_price: number;
  quantity: number;
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
    cover_image?: string;
    instructor_name?: string;
  };
  created_at: string;
}

// ✅ تایپ خلاصه سبد خرید
export interface CartSummary {
  total_original_price: number;
  total_courses_discount: number;
  coupon_code?: string;
  coupon_discount?: number;
  total_payable: number;
}

// ✅ تایپ پاسخ سبد خرید
export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
}

// ✅ تایپ برای نمایش در UI (نرمال‌شده)
export interface DisplayCartItem {
  id: string;
  enrollment_id: string;
  course_id: string;
  title: string;
  slug: string;
  price: number;
  original_price: number;
  discount: number;
  image?: string;
  date: string;
  status: "PENDING" | "PAID" | "EXPIRED";
}

// ✅ تایپ کوپن
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  max_discount_amount: number;
  min_order_amount: number;
  max_uses_per_user: number;
  allowed_courses: string[];
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

// ✅ تایپ درخواست‌ها
export interface ApplyCouponRequest {
  code: string;
}

export interface RemoveCouponRequest {
  code: string;
}

// ✅ تایپ پرداخت
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

export interface Order {
  id: string;
  user_id: string;
  coupon_id?: string | null;
  total_original_price: number;
  total_discount: number;
  final_amount: number;
  courses_snapshot: string[]; // ✅ آرایه‌ای از course_id ها
  payment_method: "card_to_card" | "bale" | string;
  status:
    | "pending"
    | "waiting_for_approval"
    | "paid"
    | "failed"
    | "cancelled"
    | "rejected";
  receipt_image_url?: string | null;
  tracking_code?: string | null;
  created_at: string;
  updated_at: string;

  // ✅ اطلاعات کاربر (از join یا populate)
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };

  // ✅ اطلاعات دوره‌ها (از populate)
  courses?: {
    id: string;
    title: string;
    price: number;
    cover_image?: string;
  }[];

  // ✅ اطلاعات کوپن (از populate)
  coupon?: {
    id: string;
    code: string;
    discount_type: "PERCENT" | "FIXED";
    discount_value: number;
  };
}
