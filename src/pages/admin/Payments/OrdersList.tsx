// src/pages/admin/Payments/OrdersList.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { paymentsAPI } from "../../../lib/api/payment";
import { usersAPI } from "../../../lib/api/users";
import PaymentDetailsModal from "../../../components/admin/PaymentDetailsModal";
import type { Order } from "../../../types/cart";
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

interface OrderWithUser extends Order {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
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
        id: userData.id,
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔄 در حال دریافت سفارشات...");

      const data = await paymentsAPI.getOrders();
      console.log("✅ سفارشات دریافت شد:", data);

      const ordersWithUser = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (order: Order) => {
          if (!order.user || !order.user.name) {
            const userData = await fetchUserData(order.user_id);
            return {
              ...order,
              user: userData,
            };
          }
          return order as OrderWithUser;
        }),
      );

      setOrders(ordersWithUser);
    } catch (err: any) {
      console.error("❌ خطا در دریافت سفارشات:", err);
      setError(err.response?.data?.detail || "خطا در دریافت سفارشات");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOrder = async (orderId: string, approved: boolean) => {
    if (!confirm(`آیا از ${approved ? "تایید" : "رد"} این سفارش مطمئن هستید؟`))
      return;

    setProcessing(orderId);
    try {
      await paymentsAPI.verifyOrder(orderId, approved);
      await fetchOrders();
      alert(`✅ سفارش با موفقیت ${approved ? "تایید" : "رد"} شد!`);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      alert(err.response?.data?.detail || "خطا در تایید سفارش");
    } finally {
      setProcessing(null);
    }
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

  // ✅ استفاده از toLowerCase برای تطابق با داده‌های بک‌اند
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
      case "cancelled":
        return "لغو شده";
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
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card_to_card":
        return "کارت به کارت";
      case "bale":
        return "ربات بله";
      default:
        return method || "نامشخص";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card_to_card":
        return <CreditCard className="w-4 h-4" />;
      case "bale":
        return <Bot className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "نامشخص";
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        (order.enrollments || []).some((e) =>
          e.course_title?.toLowerCase().includes(search),
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
              // ✅ بررسی وضعیت برای نمایش دکمه‌ها
              const isWaitingForApproval =
                order.status?.toLowerCase() === "waiting_for_approval" ||
                order.status?.toLowerCase() === "waiting";

              const statusColor = getStatusColor(order.status);
              const StatusIcon = getStatusIcon(order.status);

              const userName = order.user?.name || "کاربر ناشناس";
              const userEmail = order.user?.email || "ایمیل ثبت نشده";
              const userPhone = order.user?.phone || "";

              const displayPrice =
                order.total_payable || order.total_original_price || 0;
              const enrollments = order.enrollments || [];

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

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Wallet className="w-4 h-4" />
                        مبلغ:{" "}
                        <span className="text-white font-medium">
                          {formatPrice(displayPrice)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        {getPaymentMethodIcon(order.payment_method)}
                        روش:{" "}
                        <span className="text-white">
                          {getPaymentMethodLabel(order.payment_method)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <ShoppingBag className="w-4 h-4" />
                        دوره‌ها:{" "}
                        <span className="text-white">
                          {enrollments.length} دوره
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

                    <div className="flex flex-wrap gap-2">
                      {enrollments.map((enrollment) => (
                        <span
                          key={enrollment.id}
                          className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-300"
                        >
                          {enrollment.course_title || "دوره آموزشی"}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                      {/* ✅ دکمه‌های تایید/رد فقط برای waiting_for_approval */}
                      {isWaitingForApproval && (
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
                  orders.filter((o) => o.status?.toLowerCase() === "paid")
                    .length
                }
              </p>
              <p className="text-gray-400 text-sm">پرداخت شده</p>
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
                      o.status?.toLowerCase() === "cancelled",
                  ).length
                }
              </p>
              <p className="text-gray-400 text-sm">ناموفق/لغو شده</p>
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
        enrollment={
          selectedOrder
            ? {
                id: selectedOrder.id,
                user: selectedOrder.user,
                created_at: selectedOrder.created_at,
                status: selectedOrder.status,
                paymentStatus:
                  selectedOrder.status?.toLowerCase() === "waiting_for_approval"
                    ? "WAITING_VERIFY"
                    : selectedOrder.status?.toLowerCase() === "paid"
                      ? "PAID"
                      : "PENDING",
                course_id: selectedOrder.enrollments?.[0]?.course_id,
                event_id: undefined,
                tracking_code: selectedOrder.tracking_code,
                receipt_image_url: selectedOrder.receipt_image_url,
                payment_method: selectedOrder.payment_method,
                amount:
                  selectedOrder.total_payable ||
                  selectedOrder.total_original_price,
              }
            : {
                id: "",
                user: { name: "", email: "", phone: "" },
                created_at: "",
                status: "",
                paymentStatus: "",
              }
        }
        coursePrice={
          selectedOrder?.total_payable || selectedOrder?.total_original_price
        }
        courseTitle={
          selectedOrder?.enrollments?.[0]?.course_title || "دوره آموزشی"
        }
        onConfirm={handleConfirmFromModal}
        onReject={handleRejectFromModal}
      />
    </AdminLayout>
  );
}
