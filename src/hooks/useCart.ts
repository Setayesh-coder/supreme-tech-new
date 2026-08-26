// src/hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartAPI } from "../lib/api/cart";
import { toast } from "./use-toast";
import type { CartResponse, DisplayCartItem } from "../types/cart";

// ✅ تبدیل داده به فرمت نمایش
const toDisplayCart = (cart: CartResponse): DisplayCartItem[] => {
  return (cart.items || []).map((item) => ({
    id: item.id,
    enrollment_id: item.enrollment_id,
    course_id: item.course_id,
    title: item.course_title,
    slug: item.course?.slug || "",
    price: item.final_price || 0,
    original_price: item.original_price || 0,
    discount: (item.original_price || 0) - (item.final_price || 0),
    image: item.course?.cover_image || "",
    date: item.created_at || new Date().toISOString(),
    status: "PENDING" as const,
  }));
};

// ✅ هوک اصلی سبد خرید
// src/hooks/useCart.ts
export const useCart = () => {
  const queryClient = useQueryClient();
  const isLoggedIn = !!localStorage.getItem("token");

  // ✅ اضافه کردن refetchInterval: false
  const {
    data: cartData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      console.log("🛒 دریافت سبد خرید...");
      const result = await cartAPI.getCart();
      console.log("✅ سبد خرید دریافت شد");
      return result;
    },
    staleTime: 0,
    enabled: isLoggedIn,
    refetchInterval: false, // ✅ جلوگیری از رفرش بی‌نهایت
    refetchIntervalInBackground: false, // ✅ جلوگیری از رفرش در پس‌زمینه
    placeholderData: {
      items: [],
      summary: {
        total_original_price: 0,
        total_courses_discount: 0,
        total_payable: 0,
      },
    },
  });

  // ➕ اضافه کردن به سبد خرید
  const addToCartMutation = useMutation({
    mutationFn: cartAPI.addToCart,
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: any) => ({
        ...old,
        items: [
          ...(old?.items || []),
          {
            course_id: courseId,
            id: `temp-${Date.now()}`,
            course_title: "در حال اضافه شدن...",
          },
        ],
      }));

      return { previousCart };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await refetch();
      toast.success("✅ به سبد خرید اضافه شد");
    },
    onError: (err: any, _variables, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
      toast.error(err.response?.data?.detail || "❌ خطا در افزودن به سبد خرید");
    },
  });

  // 🗑️ حذف از سبد خرید - اصلاح شده
  const removeFromCartMutation = useMutation({
    mutationFn: cartAPI.removeFromCart,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      // ✅ اصلاح: استفاده از previousCart به جای old
      const oldItems = (previousCart as any)?.items || [];
      const removedItem = oldItems.find(
        (item: any) => item.id === id || item.enrollment_id === id,
      );

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old)
          return {
            items: [],
            summary: {
              total_original_price: 0,
              total_courses_discount: 0,
              total_payable: 0,
            },
          };

        const newItems = (old.items || []).filter(
          (item: any) => item.id !== id && item.enrollment_id !== id,
        );
        const newSummary = {
          total_original_price: Math.max(
            0,
            (old.summary?.total_original_price || 0) -
              (removedItem?.original_price || 0),
          ),
          total_courses_discount: Math.max(
            0,
            (old.summary?.total_courses_discount || 0) -
              ((removedItem?.original_price || 0) -
                (removedItem?.final_price || 0)),
          ),
          total_payable: Math.max(
            0,
            (old.summary?.total_payable || 0) - (removedItem?.final_price || 0),
          ),
          coupon_code: old.summary?.coupon_code,
          coupon_discount: old.summary?.coupon_discount || 0,
        };

        return {
          ...old,
          items: newItems,
          summary: newSummary,
        };
      });

      return { previousCart };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await refetch();
      toast.success("✅ از سبد خرید حذف شد");
    },
    onError: (err: any, _variables, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
      toast.error(err.response?.data?.detail || "❌ خطا در حذف از سبد خرید");
    },
  });

  // 🎫 اعمال کد تخفیف
  const applyCouponMutation = useMutation({
    mutationFn: cartAPI.applyCoupon,
    onSuccess: async (data) => {
      queryClient.setQueryData(["cart"], data);
      await refetch();
      toast.success("✅ کد تخفیف اعمال شد");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "❌ کد تخفیف نامعتبر است");
    },
  });

  // ❌ حذف کد تخفیف
  const removeCouponMutation = useMutation({
    mutationFn: cartAPI.removeCoupon,
    onSuccess: async (data) => {
      queryClient.setQueryData(["cart"], data);
      await refetch();
      toast.success("✅ کد تخفیف حذف شد");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "❌ خطا در حذف کد تخفیف");
    },
  });

  // محاسبه مقادیر
  const items = cartData?.items || [];
  const displayItems = toDisplayCart(
    cartData || {
      items: [],
      summary: {
        total_original_price: 0,
        total_courses_discount: 0,
        total_payable: 0,
      },
    },
  );
  const summary = cartData?.summary || {
    total_original_price: 0,
    total_courses_discount: 0,
    total_payable: 0,
  };

  const totalItems = items.length;
  const totalPrice = summary.total_payable || 0;
  const totalOriginalPrice = summary.total_original_price || 0;
  const totalDiscount = summary.total_courses_discount || 0;
  const couponDiscount = summary.coupon_discount || 0;
  const couponCode = summary.coupon_code;
  const isEmpty = totalItems === 0;

  return {
    // داده‌ها
    items,
    displayItems,
    summary,
    totalItems,
    totalPrice,
    totalOriginalPrice,
    totalDiscount,
    couponDiscount,
    couponCode,
    isEmpty,
    isLoading,
    error,

    // توابع
    addToCart: addToCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    removeFromCart: removeFromCartMutation.mutate,
    isRemovingFromCart: removeFromCartMutation.isPending,
    applyCoupon: applyCouponMutation.mutate,
    isApplyingCoupon: applyCouponMutation.isPending,
    removeCoupon: removeCouponMutation.mutate,
    isRemovingCoupon: removeCouponMutation.isPending,
    refetch,
  };
};
