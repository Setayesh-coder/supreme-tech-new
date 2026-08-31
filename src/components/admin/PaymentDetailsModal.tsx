// src/components/admin/PaymentDetailsModal.tsx
import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  FileImage,
  Download,
  Check,
  X as XIcon,
  Loader2,
  CreditCard,
  Bot,
  User,
  Wallet,
  BookOpen,
  Calendar,
  Tag,
  Copy,
  CheckCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { paymentsAPI } from "../../lib/api/payment";
import type { Enrollment, BalePaymentCallback } from "../../types/cart";
import { toast } from "sonner";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: Enrollment;
  onConfirm: (enrollmentId: string) => Promise<void>;
  onReject: (enrollmentId: string) => Promise<void>;
  onRefresh?: () => void;
  coursePrice?: number;
  courseTitle?: string;
  original_price?: number;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  enrollment,
  onConfirm,
  onReject,
  onRefresh,
}: PaymentDetailsModalProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [baleCallbackData, setBaleCallbackData] =
    useState<BalePaymentCallback | null>(null);
  const [isFetchingBale, setIsFetchingBale] = useState(false);

  useEffect(() => {
    if (isOpen && enrollment?.id) {
      console.log("📦 Enrollment data received:", enrollment);
      console.log("📦 Course data:", enrollment.course);
      console.log("📦 Course ID:", enrollment.course_id);
      console.log("📦 Payment method:", enrollment.payment_method);
    }
  }, [isOpen, enrollment]);

  useEffect(() => {
    if (isOpen && enrollment?.id) {
      setPaymentDetails({
        id: enrollment.id,
        enrollment_id: enrollment.id,
        payment_method: enrollment.payment_method || "card_to_card",
        tracking_code: enrollment.tracking_code,
        receipt_image_url: enrollment.receipt_image_url,
        transaction_id: enrollment.transaction_id,
        amount: enrollment.amount,
        status: enrollment.payment_status,
        created_at: enrollment.created_at,
        updated_at: enrollment.updated_at,
      });

      if (enrollment.payment_method === "bale" && enrollment.transaction_id) {
        fetchBaleCallbackData(enrollment.transaction_id);
      }

      setLoading(false);
      setError("");
    }
  }, [isOpen, enrollment]);

  const fetchBaleCallbackData = async (transactionId: string) => {
    try {
      setIsFetchingBale(true);
      const response = await paymentsAPI.getBalePaymentCallback(transactionId);
      setBaleCallbackData(response);

      setPaymentDetails((prev: any) => ({
        ...prev,
        payment_data: response.payment_data,
        transaction_id: response.transaction_id || prev.transaction_id,
        status: response.status === "success" ? "PAID" : prev.status,
      }));
    } catch (error) {
      console.error("❌ خطا در دریافت callback بله:", error);
    } finally {
      setIsFetchingBale(false);
    }
  };

  const handleRefreshBale = () => {
    if (enrollment.transaction_id) {
      fetchBaleCallbackData(enrollment.transaction_id);
      toast.info("در حال بروزرسانی اطلاعات پرداخت...");
    }
  };

  if (!isOpen) return null;

  const getStatusLabel = (status: string) => {
    const labels: Record<
      string,
      { label: string; color: string; icon: any; bg: string }
    > = {
      PENDING: {
        label: "در انتظار",
        color: "text-yellow-400",
        icon: Clock,
        bg: "bg-yellow-500/20",
      },
      CONFIRMED: {
        label: "تایید شده",
        color: "text-green-400",
        icon: CheckCircle,
        bg: "bg-green-500/20",
      },
      CANCELLED: {
        label: "لغو شده",
        color: "text-red-400",
        icon: XCircle,
        bg: "bg-red-500/20",
      },
      COMPLETED: {
        label: "تکمیل شده",
        color: "text-green-400",
        icon: CheckCircle,
        bg: "bg-green-500/20",
      },
      WAITING: {
        label: "در انتظار تایید",
        color: "text-yellow-400",
        icon: Clock,
        bg: "bg-yellow-500/20",
      },
    };
    return labels[status] || labels.PENDING;
  };

  const getPaymentStatusLabel = (status?: string) => {
    const labels: Record<string, { label: string; color: string; bg: string }> =
      {
        PENDING: {
          label: "در انتظار پرداخت",
          color: "text-yellow-400",
          bg: "bg-yellow-500/20",
        },
        PAID: {
          label: "پرداخت شده",
          color: "text-green-400",
          bg: "bg-green-500/20",
        },
        UNPAID: {
          label: "پرداخت نشده",
          color: "text-red-400",
          bg: "bg-red-500/20",
        },
        WAITING_VERIFY: {
          label: "در انتظار تایید",
          color: "text-blue-400",
          bg: "bg-blue-500/20",
        },
      };
    return labels[status || "PENDING"] || labels.PENDING;
  };

  const status = getStatusLabel(enrollment.status);
  const paymentStatus = getPaymentStatusLabel(enrollment.payment_status);
  const StatusIcon = status.icon;

  // ✅ محاسبه مبلغ قابل پرداخت و تخفیف
  const calculatePrices = () => {
    const originalPrice =
      // enrollment.course?.original_price ||
      enrollment.course?.price || enrollment.amount || 0;
    const finalPrice = enrollment.amount || enrollment.course?.price || 0;
    const discountAmount = originalPrice - finalPrice;
    const discountPercent =
      originalPrice > 0
        ? Math.round((discountAmount / originalPrice) * 100)
        : 0;

    return { originalPrice, finalPrice, discountAmount, discountPercent };
  };

  const { originalPrice, finalPrice, discountAmount, discountPercent } =
    calculatePrices();

  // ✅ تشخیص وضعیت‌ها
  const isCompleted =
    enrollment.status === "COMPLETED" ||
    enrollment.status === "CONFIRMED" ||
    enrollment.payment_status === "PAID";

  const isPending =
    enrollment.payment_status === "PENDING" || enrollment.status === "PENDING";

  const isWaitingForApproval =
    enrollment.payment_status === "WAITING_VERIFY" ||
    enrollment.status === "WAITING";

  // ✅ نمایش دکمه‌های تایید/رد فقط در حالت "در انتظار تایید ادمین"
  const showActionButtons = isWaitingForApproval && !isCompleted && !isPending;

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

  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return "نامشخص";
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
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

  const hasCourse = !!enrollment.course;
  const hasEvent = !!enrollment.event;
  const hasCourseId = !!enrollment.course_id;
  const hasEventId = !!enrollment.event_id;

  const getItemTitle = () => {
    if (hasCourse && enrollment.course?.title) {
      return enrollment.course.title;
    }
    if (hasEvent && enrollment.event?.title) {
      return enrollment.event.title;
    }
    if (hasCourseId && typeof enrollment.course_id === "string") {
      return `دوره ${enrollment.course_id.substring(0, 8)}`;
    }
    if (hasEventId && typeof enrollment.event_id === "string") {
      return `رویداد ${enrollment.event_id.substring(0, 8)}`;
    }
    if (enrollment.user?.name) {
      return `سفارش ${enrollment.user.name}`;
    }
    return "محصول نامشخص";
  };

  const getItemId = () => {
    if (hasCourse) return enrollment.course?.id || enrollment.course_id;
    if (hasEvent) return enrollment.event?.id || enrollment.event_id;
    if (enrollment.course_id) return enrollment.course_id;
    if (enrollment.event_id) return enrollment.event_id;
    return enrollment.id;
  };

  const getItemIcon = () => {
    if (hasCourse) return <BookOpen className="w-4 h-4" />;
    if (hasEvent) return <Calendar className="w-4 h-4" />;
    return <Tag className="w-4 h-4" />;
  };

  const getItemType = () => {
    if (hasCourse) return "دوره";
    if (hasEvent) return "رویداد";
    if (hasCourseId) return "دوره";
    if (hasEventId) return "رویداد";
    if (enrollment.user?.name) return "سفارش";
    return "محصول";
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("کپی شد!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm(enrollment.id);
      toast.success("پرداخت با موفقیت تایید شد");
      if (onRefresh) onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "خطا در تایید پرداخت");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      await onReject(enrollment.id);
      toast.success("پرداخت رد شد");
      if (onRefresh) onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "خطا در رد پرداخت");
    } finally {
      setIsProcessing(false);
    }
  };

  const getBaleStatus = () => {
    if (!baleCallbackData) return null;
    if (baleCallbackData.status === "success") {
      return { label: "موفق", color: "text-green-400", icon: CheckCircle };
    } else if (baleCallbackData.status === "failed") {
      return { label: "ناموفق", color: "text-red-400", icon: XCircle };
    }
    return { label: "در انتظار", color: "text-yellow-400", icon: Clock };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <LiquidGlassCard
          className="p-6 md:p-8 relative"
          borderRadius="24px"
          blurIntensity="xl"
          glowIntensity="lg"
          shadowIntensity="lg"
        >
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              جزئیات پرداخت
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-gray-400 text-sm">شناسه ثبت‌نام:</span>
              <code className="text-blue-400 text-sm font-mono bg-blue-500/10 px-2 py-0.5 rounded">
                #{enrollment.id.slice(0, 8).toUpperCase()}
              </code>
              <button
                onClick={() => handleCopy(enrollment.id)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
              >
                {copied ? (
                  <CheckCheck className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="text-gray-400 mr-3">در حال بارگذاری...</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color} ${status.bg}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatus.color} ${paymentStatus.bg}`}
                >
                  {paymentStatus.label}
                </span>
              </div>

              {/* ✅ بخش قیمت با تخفیف */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  اطلاعات مالی
                </h3>

                <div className="space-y-2">
                  {/* قیمت اصلی */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">قیمت اصلی</span>
                    <span className="text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  </div>

                  {/* تخفیف */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 text-sm">تخفیف</span>
                      <span className="text-green-400">
                        {discountPercent}% ({formatPrice(discountAmount)})
                      </span>
                    </div>
                  )}

                  {/* مبلغ قابل پرداخت */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white font-medium">
                      مبلغ قابل پرداخت
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {formatPrice(finalPrice)}
                    </span>
                  </div>

                  {/* وضعیت پرداخت */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">وضعیت پرداخت</span>
                    <span
                      className={`font-medium ${
                        isCompleted
                          ? "text-green-400"
                          : isPending
                            ? "text-yellow-400"
                            : "text-blue-400"
                      }`}
                    >
                      {isCompleted
                        ? "تکمیل شده"
                        : isPending
                          ? "در انتظار پرداخت"
                          : "در انتظار تایید"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ بخش اطلاعات محصول */}
              <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/5">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  {getItemIcon()}
                  اطلاعات {getItemType()}
                </h3>
                <div>
                  <p className="text-white font-medium text-lg">
                    {getItemTitle()}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-sm">
                    <span className="text-gray-400">
                      قیمت اصلی: {formatPrice(originalPrice)}
                    </span>
                    <span className="text-green-400">
                      قیمت نهایی: {formatPrice(finalPrice)}
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-green-400">
                        تخفیف: {discountPercent}%
                      </span>
                    )}
                    <span className="text-gray-400">
                      شناسه: #{String(getItemId()).substring(0, 8) || "نامشخص"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ بخش اطلاعات کاربر */}
              <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/5">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  اطلاعات کاربر
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {enrollment.user.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {enrollment.user.name || "کاربر ناشناس"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {enrollment.user.email || "ایمیل ثبت نشده"}
                        </span>
                      </span>
                      {enrollment.user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {enrollment.user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ بخش اطلاعات پرداخت */}
              <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    {getPaymentMethodIcon(paymentDetails?.payment_method)}
                    اطلاعات پرداخت
                  </h3>

                  {paymentDetails?.payment_method?.toLowerCase() === "bale" && (
                    <button
                      onClick={handleRefreshBale}
                      disabled={isFetchingBale}
                      className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-blue-400 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          isFetchingBale ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-gray-500 text-xs">مبلغ پرداختی</p>
                    <p className="text-white font-medium text-base">
                      {formatPrice(paymentDetails?.amount || enrollment.amount)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-gray-500 text-xs">تاریخ ثبت</p>
                    <p className="text-white text-xs">
                      {formatDate(
                        paymentDetails?.created_at || enrollment.created_at,
                      )}
                    </p>
                  </div>

                  <div className="col-span-2 bg-white/5 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">روش پرداخت</p>
                    <p className="text-white font-medium flex items-center gap-2 mt-1">
                      {getPaymentMethodIcon(paymentDetails?.payment_method)}
                      {getPaymentMethodLabel(paymentDetails?.payment_method)}
                    </p>
                  </div>

                  {paymentDetails?.payment_method?.toLowerCase() ===
                    "card_to_card" &&
                    paymentDetails?.tracking_code && (
                      <div className="col-span-2 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 text-xs">کد پیگیری</p>
                          <button
                            onClick={() =>
                              handleCopy(paymentDetails.tracking_code)
                            }
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                          >
                            {copied ? (
                              <CheckCheck className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-blue-400 font-mono text-sm font-bold mt-1">
                          {paymentDetails.tracking_code}
                        </p>
                      </div>
                    )}

                  {paymentDetails?.payment_method?.toLowerCase() === "bale" &&
                    paymentDetails?.transaction_id && (
                      <div className="col-span-2 bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 text-xs">شناسه تراکنش</p>
                          <button
                            onClick={() =>
                              handleCopy(paymentDetails.transaction_id)
                            }
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                          >
                            {copied ? (
                              <CheckCheck className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-purple-400 font-mono text-sm font-bold mt-1">
                          {paymentDetails.transaction_id}
                        </p>
                      </div>
                    )}

                  {paymentDetails?.payment_method?.toLowerCase() === "bale" &&
                    baleCallbackData && (
                      <div className="col-span-2 bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                        <p className="text-gray-500 text-xs">
                          وضعیت تراکنش بله
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const baleStatus = getBaleStatus();
                            return baleStatus ? (
                              <span
                                className={`flex items-center gap-1 ${baleStatus.color}`}
                              >
                                {baleStatus.icon && (
                                  <baleStatus.icon className="w-4 h-4" />
                                )}
                                <span className="font-medium">
                                  {baleStatus.label}
                                </span>
                              </span>
                            ) : null;
                          })()}
                          {baleCallbackData.payment_data?.ref_id && (
                            <span className="text-gray-400 text-xs mr-2">
                              Ref: {baleCallbackData.payment_data.ref_id}
                            </span>
                          )}
                        </div>
                        {baleCallbackData.payment_data?.card_pan && (
                          <p className="text-gray-400 text-xs mt-1">
                            شماره کارت: {baleCallbackData.payment_data.card_pan}
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {paymentDetails?.payment_method?.toLowerCase() ===
                "card_to_card" &&
                paymentDetails?.receipt_image_url && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      تصویر رسید
                    </h3>
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-white/5 group">
                      {!imageError ? (
                        <img
                          src={paymentDetails.receipt_image_url}
                          alt="تصویر رسید"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500">
                          <FileImage className="w-12 h-12 text-gray-600" />
                          <p className="text-sm">تصویر رسید موجود نیست</p>
                        </div>
                      )}
                      <a
                        href={paymentDetails.receipt_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  </div>
                )}

              {/* ✅ دکمه‌های تایید/رد - فقط در حالت "در انتظار تایید ادمین" */}
              {showActionButtons && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <GlassButton
                    variant="secondary"
                    size="md"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    icon={
                      isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XIcon className="w-4 h-4" />
                      )
                    }
                    iconPosition="left"
                  >
                    {isProcessing ? "در حال پردازش..." : "رد پرداخت"}
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    size="md"
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    icon={
                      isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )
                    }
                    iconPosition="left"
                  >
                    {isProcessing ? "در حال پردازش..." : "تایید پرداخت"}
                  </GlassButton>
                </div>
              )}

              {/* ✅ نمایش پیام تکمیل شده */}
              {isCompleted && !isWaitingForApproval && !isPending && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">
                    این پرداخت تکمیل شده است
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    کاربر به دوره دسترسی کامل دارد
                  </p>
                </div>
              )}

              {/* ✅ نمایش پیام در انتظار پرداخت */}
              {isPending && !isWaitingForApproval && !isCompleted && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-400 font-medium">
                    در انتظار پرداخت
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    کاربر هنوز پرداخت را انجام نداده است
                  </p>
                </div>
              )}

              <div className="pt-2">
                <GlassButton
                  variant="white"
                  size="md"
                  onClick={onClose}
                  fullWidth
                  disabled={isProcessing}
                >
                  بستن
                </GlassButton>
              </div>
            </div>
          )}
        </LiquidGlassCard>
      </div>
    </div>
  );
}
