// src/pages/admin/Payments/OrdersList.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { paymentsAPI } from "../../../lib/api/payment";
import { usersAPI } from "../../../lib/api/users";
import { coursesAPI } from "../../../lib/api/courses";
import PaymentDetailsModal from "../../../components/admin/PaymentDetailsModal";
import type { Order } from "../../../types/cart";
import { showConfirmToast } from "../../../components/ui/confirm-toast";
import {
  Loader2,
  ShoppingBag,
  Search,
  Calendar,
  User,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  CreditCard,
  Bot,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

interface OrderWithUser extends Order {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  courses?: {
    id: string;
    title: string;
    price: number;
    cover_image?: string;
  }[];
}

export default function OrdersList() {
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithUser | null>(
    null,
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const userData = await usersAPI.getById(userId);
      return {
        id: userData.id || userId,
        name: userData.name || "کاربر ناشناس",
        email: userData.email || "ایمیل ثبت نشده",
        phone: userData.phone || "",
      };
    } catch (error) {
      console.error(`❌ خطا در دریافت اطلاعات کاربر ${userId}:`, error);
      return {
        id: userId,
        name: "کاربر ناشناس",
        email: "ایمیل ثبت نشده",
        phone: "",
      };
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    if (!courseId) {
      return {
        id: "unknown",
        title: "دوره نامشخص",
        price: 0,
        cover_image: "",
      };
    }

    try {
      const course = await coursesAPI.getById(courseId);
      return {
        id: course.id || courseId,
        title: course.title || `دوره ${courseId.substring(0, 8)}`,
        price: course.price || 0,
        cover_image: course.cover_image || "",
      };
    } catch (error) {
      console.error(`❌ خطا در دریافت اطلاعات دوره ${courseId}:`, error);
      return {
        id: courseId,
        title: `دوره ${courseId.substring(0, 8)}`,
        price: 0,
        cover_image: "",
      };
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔄 در حال دریافت سفارشات...");

      const data = await paymentsAPI.getOrders();
      console.log("✅ سفارشات دریافت شد:", data);

      if (!Array.isArray(data)) {
        console.error("❌ داده دریافتی آرایه نیست:", data);
        setOrders([]);
        return;
      }

      const ordersWithDetails = await Promise.all(
        data.map(async (order: Order) => {
          let userData = order.user;
          if (!userData || !userData.id || !userData.name) {
            userData = await fetchUserData(order.user_id);
          }

          let coursesData: any[] = [];
          if (order.courses_snapshot && Array.isArray(order.courses_snapshot)) {
            const validCourseIds = order.courses_snapshot.filter(
              (id) => id && typeof id === "string",
            );

            if (validCourseIds.length > 0) {
              try {
                coursesData = await Promise.all(
                  validCourseIds.map(async (courseId: string) => {
                    const course = await fetchCourseDetails(courseId);
                    return course;
                  }),
                );
              } catch (err) {
                console.error("❌ خطا در دریافت دوره‌ها:", err);
                coursesData = validCourseIds.map((id: string) => ({
                  id: id,
                  title: `دوره ${id.substring(0, 8)}`,
                  price: 0,
                  cover_image: "",
                }));
              }
            }
          }

          if (
            order.courses &&
            order.courses.length > 0 &&
            coursesData.length === 0
          ) {
            coursesData = order.courses.map((course) => ({
              id: course.id,
              title: course.title || "دوره آموزشی",
              price: course.price || 0,
              cover_image: course.cover_image || "",
            }));
          }

          return {
            ...order,
            user: userData,
            courses: coursesData,
          };
        }),
      );

      setOrders(ordersWithDetails);
    } catch (err: any) {
      console.error("❌ خطا در دریافت سفارشات:", err);
      setError(err.response?.data?.detail || "خطا در دریافت سفارشات");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOrder = async (orderId: string, approved: boolean) => {
    const actionText = approved ? "تایید" : "رد";

    showConfirmToast({
      title: `آیا از ${actionText} این سفارش مطمئن هستید؟`,
      description: approved
        ? "پس از تایید، سفارش نهایی می‌شود."
        : "پس از رد، سفارش لغو می‌شود.",
      variant: approved ? "warning" : "danger",
      confirmText: `بله، ${actionText} شود`,
      cancelText: "انصراف",
      onConfirm: async () => {
        setProcessing(orderId);
        try {
          await paymentsAPI.verifyOrder(orderId, approved);
          await fetchOrders();
          toast.success(`✅ سفارش با موفقیت ${actionText} شد!`);
        } catch (err: any) {
          console.error("❌ خطا:", err);
          toast.error(
            err.response?.data?.detail || `❌ خطا در ${actionText} سفارش`,
          );
        } finally {
          setProcessing(null);
        }
      },
    });
  };

  const handleViewDetails = (order: OrderWithUser) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleConfirmFromModal = async (enrollmentId: string) => {
    await handleVerifyOrder(enrollmentId, true);
    setShowPaymentModal(false);
  };

  const handleRejectFromModal = async (enrollmentId: string) => {
    await handleVerifyOrder(enrollmentId, false);
    setShowPaymentModal(false);
  };

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return "نامشخص";

    const normalizedMethod = method.toLowerCase().trim();
    switch (normalizedMethod) {
      case "card_to_card":
      case "cardtocard":
      case "card-to-card":
        return "کارت به کارت";
      case "bale":
        return "ربات بله";
      default:
        return method || "نامشخص";
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return <Wallet className="w-4 h-4" />;

    const normalizedMethod = method.toLowerCase().trim();
    switch (normalizedMethod) {
      case "card_to_card":
      case "cardtocard":
      case "card-to-card":
        return <CreditCard className="w-4 h-4" />;
      case "bale":
        return <Bot className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  // ✅ توابع تشخیص وضعیت
  const shouldShowActionButtons = (order: OrderWithUser) => {
    const status = order.status?.toLowerCase();
    return status === "waiting_for_approval" || status === "waiting";
  };

  const isCompleted = (order: OrderWithUser) => {
    const status = order.status?.toLowerCase();
    return (
      status === "confirmed" || status === "completed" || status === "paid"
    );
  };

  const isPending = (order: OrderWithUser) => {
    const status = order.status?.toLowerCase();
    return status === "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "waiting_for_approval":
      case "waiting":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "pending":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "failed":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "cancelled":
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
      case "rejected":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "confirmed":
      case "completed":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "پرداخت شده";
      case "waiting_for_approval":
      case "waiting":
        return "در انتظار تایید ادمین";
      case "pending":
        return "در انتظار پرداخت";
      case "failed":
        return "ناموفق";
      case "rejected":
        return "رد شده";
      case "cancelled":
        return "لغو شده";
      case "confirmed":
      case "completed":
        return "تکمیل شده";
      default:
        return status || "نامشخص";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "waiting_for_approval":
      case "waiting":
        return <Timer className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "confirmed":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "نامشخص";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "نامشخص";
    }
  };

  const formatPrice = (price: number) => {
    if (!price && price !== 0) return "نامشخص";
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter === "all") return true;
      return order.status?.toLowerCase() === statusFilter.toLowerCase();
    })
    .filter((order) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        order.user?.name?.toLowerCase().includes(search) ||
        order.user?.email?.toLowerCase().includes(search) ||
        order.id?.toLowerCase().includes(search) ||
        (order.courses || []).some((c) =>
          c.title?.toLowerCase().includes(search),
        )
      );
    });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-gray-400 mr-3">در حال بارگذاری سفارشات...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* هدر */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-7 h-7 text-blue-400" />
              مدیریت سفارشات
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {orders.length} سفارش در سیستم
            </p>
          </div>
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={fetchOrders}
            icon={<RefreshCw className="w-4 h-4" />}
            iconPosition="left"
          >
            بروزرسانی
          </GlassButton>
        </div>

        {/* فیلترها */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام کاربر، ایمیل، شناسه سفارش یا عنوان دوره..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">همه سفارشات</option>
            <option value="waiting_for_approval">⏳ در انتظار تایید</option>
            <option value="paid">✅ پرداخت شده</option>
            <option value="pending">💳 در انتظار پرداخت</option>
            <option value="failed">❌ ناموفق</option>
            <option value="cancelled">🚫 لغو شده</option>
            <option value="rejected">🚫 رد شده</option>
            <option value="confirmed">✅ تکمیل شده</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            ❌ {error}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <LiquidGlassCard
            className="p-12 text-center"
            borderRadius="16px"
            blurIntensity="sm"
          >
            <div className="text-6xl mb-4">
              <ShoppingBag className="w-16 h-16 mx-auto text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm || statusFilter !== "all"
                ? "نتیجه‌ای یافت نشد"
                : "هیچ سفارشی ثبت نشده است"}
            </h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== "all"
                ? "با فیلترهای دیگری جستجو کنید"
                : "به محض ثبت اولین سفارش، در اینجا نمایش داده می‌شود"}
            </p>
          </LiquidGlassCard>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const showActions = shouldShowActionButtons(order);
              const completed = isCompleted(order);
              const pending = isPending(order);

              const statusColor = getStatusColor(order.status);
              const StatusIcon = getStatusIcon(order.status);

              const userName = order.user?.name || "کاربر ناشناس";
              const userEmail = order.user?.email || "ایمیل ثبت نشده";
              const userPhone = order.user?.phone || "";

              const displayOriginalPrice =
                order.total_original_price || order.final_amount || 0;
              const displayFinalPrice =
                order.final_amount || order.total_original_price || 0;
              const hasDiscount = displayOriginalPrice > displayFinalPrice;
              const discountPercent =
                displayOriginalPrice > 0
                  ? Math.round(
                      ((displayOriginalPrice - displayFinalPrice) /
                        displayOriginalPrice) *
                        100,
                    )
                  : 0;

              const courses = order.courses || [];

              return (
                <LiquidGlassCard
                  key={order.id}
                  className="p-4 hover:scale-[1.01] transition-all duration-300"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">
                              {userName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {userEmail}
                              </span>
                              {userPhone && (
                                <span className="flex items-center gap-1">
                                  <span>📱</span>
                                  {userPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${statusColor}`}
                        >
                          {StatusIcon}
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* قیمت اصلی و قابل پرداخت */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Wallet className="w-4 h-4" />
                        قیمت اصلی:
                        <span className="text-gray-400 line-through">
                          {formatPrice(displayOriginalPrice)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-white font-medium">
                        مبلغ قابل پرداخت:
                        <span className="text-green-400">
                          {formatPrice(displayFinalPrice)}
                        </span>
                      </span>
                      {hasDiscount && (
                        <span className="text-green-400 text-xs">
                          تخفیف: {discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* روش پرداخت */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-400">
                        {getPaymentMethodIcon(order.payment_method)}
                        روش:{" "}
                        <span className="text-white font-medium">
                          {getPaymentMethodLabel(order.payment_method)}
                        </span>
                      </span>
                      {order.tracking_code && (
                        <span className="flex items-center gap-1 text-gray-400">
                          کد پیگیری:{" "}
                          <span className="text-blue-400 font-mono">
                            {order.tracking_code}
                          </span>
                        </span>
                      )}
                    </div>

                    {courses.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {courses.map((course, index) => (
                          <span
                            key={course.id || `course-${index}`}
                            className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-300"
                          >
                            {course.title || "دوره آموزشی"}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ✅ دکمه‌ها با منطق صحیح */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                      {/* ✅ فقط "در انتظار تایید ادمین" دکمه دارد */}
                      {showActions && (
                        <>
                          <GlassButton
                            variant="primary"
                            size="sm"
                            loading={processing === order.id}
                            disabled={!!processing}
                            icon={<CheckCircle className="w-4 h-4" />}
                            iconPosition="left"
                            onClick={() => handleVerifyOrder(order.id, true)}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                          >
                            تایید
                          </GlassButton>
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            loading={processing === order.id}
                            disabled={!!processing}
                            icon={<XCircle className="w-4 h-4" />}
                            iconPosition="left"
                            onClick={() => handleVerifyOrder(order.id, false)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                          >
                            رد
                          </GlassButton>
                        </>
                      )}

                      {/* ✅ وضعیت تکمیل شده */}
                      {completed && (
                        <span className="text-green-400 text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          تکمیل شده
                        </span>
                      )}

                      {/* ✅ وضعیت در انتظار پرداخت - بدون دکمه */}
                      {pending && (
                        <span className="text-yellow-400 text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          در انتظار پرداخت
                        </span>
                      )}

                      {/* ✅ وضعیت‌های دیگر (رد/لغو/ناموفق) */}
                      {!showActions && !completed && !pending && (
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          {getStatusLabel(order.status)}
                        </span>
                      )}

                      {/* دکمه جزئیات - همیشه نمایش داده می‌شود */}
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        iconPosition="left"
                        onClick={() => handleViewDetails(order)}
                      >
                        جزئیات کامل
                      </GlassButton>

                      <span className="text-gray-500 text-xs">
                        شناسه: {order.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </LiquidGlassCard>
              );
            })}
          </div>
        )}

        {/* آمار */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <LiquidGlassCard
              className="p-4 text-center"
              borderRadius="12px"
              blurIntensity="sm"
            >
              <p className="text-2xl font-bold text-white">{orders.length}</p>
              <p className="text-gray-400 text-sm">کل سفارشات</p>
            </LiquidGlassCard>
            <LiquidGlassCard
              className="p-4 text-center"
              borderRadius="12px"
              blurIntensity="sm"
            >
              <p className="text-2xl font-bold text-blue-400">
                {
                  orders.filter(
                    (o) =>
                      o.status?.toLowerCase() === "waiting_for_approval" ||
                      o.status?.toLowerCase() === "waiting",
                  ).length
                }
              </p>
              <p className="text-gray-400 text-sm">در انتظار تایید</p>
            </LiquidGlassCard>
            <LiquidGlassCard
              className="p-4 text-center"
              borderRadius="12px"
              blurIntensity="sm"
            >
              <p className="text-2xl font-bold text-green-400">
                {
                  orders.filter(
                    (o) =>
                      o.status?.toLowerCase() === "paid" ||
                      o.status?.toLowerCase() === "confirmed" ||
                      o.status?.toLowerCase() === "completed",
                  ).length
                }
              </p>
              <p className="text-gray-400 text-sm">تکمیل شده</p>
            </LiquidGlassCard>
            <LiquidGlassCard
              className="p-4 text-center"
              borderRadius="12px"
              blurIntensity="sm"
            >
              <p className="text-2xl font-bold text-red-400">
                {
                  orders.filter(
                    (o) =>
                      o.status?.toLowerCase() === "failed" ||
                      o.status?.toLowerCase() === "cancelled" ||
                      o.status?.toLowerCase() === "rejected",
                  ).length
                }
              </p>
              <p className="text-gray-400 text-sm">ناموفق/رد/لغو شده</p>
            </LiquidGlassCard>
          </div>
        )}
      </div>
      <PaymentDetailsModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedOrder(null);
        }}
        enrollment={{
          id: selectedOrder?.id || "",
          user_id: selectedOrder?.user_id || "",
          user: {
            id: selectedOrder?.user?.id || selectedOrder?.user_id || "",
            name: selectedOrder?.user?.name || "کاربر ناشناس",
            email: selectedOrder?.user?.email || "ایمیل ثبت نشده",
            phone: selectedOrder?.user?.phone || undefined,
          },
          created_at: selectedOrder?.created_at || new Date().toISOString(),
          status: (selectedOrder?.status?.toUpperCase() as any) || "PENDING",
          payment_status:
            selectedOrder?.status?.toLowerCase() === "waiting_for_approval"
              ? "WAITING_VERIFY"
              : selectedOrder?.status?.toLowerCase() === "paid" ||
                  selectedOrder?.status?.toLowerCase() === "confirmed" ||
                  selectedOrder?.status?.toLowerCase() === "completed"
                ? "PAID"
                : "PENDING",
          payment_method:
            (selectedOrder?.payment_method as "card_to_card" | "bale") ||
            "card_to_card",
          amount:
            selectedOrder?.final_amount ||
            selectedOrder?.total_original_price ||
            0,
          tracking_code: selectedOrder?.tracking_code || null,
          receipt_image_url: selectedOrder?.receipt_image_url || null,
          transaction_id: selectedOrder?.tracking_code || null,

          // ✅ اصلاح: دریافت course_id از selectedOrder
          course_id: (() => {
            // 1. از courses
            if (selectedOrder?.courses && selectedOrder.courses.length > 0) {
              return selectedOrder.courses[0].id || null;
            }
            // 2. از courses_snapshot
            if (
              selectedOrder?.courses_snapshot &&
              selectedOrder.courses_snapshot.length > 0
            ) {
              const first = selectedOrder.courses_snapshot[0];
              if (typeof first === "string") {
                return first;
              }
              if (first && typeof first === "object") {
                const obj = first as Record<string, any>;
                return obj.id || obj.course_id || obj._id || null;
              }
            }
            return null;
          })(),

          // ✅ اصلاح: دریافت اطلاعات course از selectedOrder
          course: (() => {
            // 1. از courses
            if (selectedOrder?.courses && selectedOrder.courses.length > 0) {
              const course = selectedOrder.courses[0];
              return {
                id: course.id || "",
                title: course.title || "دوره آموزشی",
                price: course.price || 0,
                original_price:
                  (course as any).original_price || course.price || 0,
                cover_image: (course as any).cover_image || "",
                slug: (course as any).slug || "",
              };
            }
            // 2. از courses_snapshot
            if (
              selectedOrder?.courses_snapshot &&
              selectedOrder.courses_snapshot.length > 0
            ) {
              const first = selectedOrder.courses_snapshot[0];

              if (typeof first === "string") {
                // ✅ فقط از شناسه استفاده کن، چون اطلاعات کامل نداریم
                return {
                  id: first,
                  title: `دوره ${first.substring(0, 8)}`,
                  price: selectedOrder.final_amount || 0,
                  original_price:
                    selectedOrder.total_original_price ||
                    selectedOrder.final_amount ||
                    0,
                  cover_image: "",
                  slug: "",
                };
              }

              if (first && typeof first === "object") {
                const obj = first as Record<string, any>;
                const id = obj.id || obj.course_id || obj._id || "";
                return {
                  id: id,
                  title:
                    obj.title ||
                    obj.name ||
                    `دوره ${String(id).substring(0, 8)}`,
                  price: obj.price || 0,
                  original_price: obj.original_price || obj.price || 0,
                  cover_image: obj.cover_image || obj.image || "",
                  slug: obj.slug || "",
                };
              }
            }
            return undefined;
          })(),
          updated_at: selectedOrder?.updated_at || new Date().toISOString(),
        }}
        onConfirm={handleConfirmFromModal}
        onReject={handleRejectFromModal}
        onRefresh={fetchOrders}
      />
    </AdminLayout>
  );
}
