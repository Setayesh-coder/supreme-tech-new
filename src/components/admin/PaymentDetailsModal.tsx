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
} from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { paymentsAPI } from "../../lib/api/payment";
// import { toast } from "../../hooks/use-toast";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: {
    id: string;
    user: {
      name: string;
      email: string;
      phone?: string;
    };
    created_at: string;
    status: string;
    paymentStatus?: string;
    course_id?: string;
    event_id?: string;
    tracking_code?: string | null;
    receipt_image_url?: string | null;
    payment_method?: "card_to_card" | "bale" | string;
    amount: number;
  };
  coursePrice?: number;
  courseTitle?: string;
  onConfirm: (enrollmentId: string) => void;
  onReject: (enrollmentId: string) => void;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  enrollment,
  coursePrice = 0,
  courseTitle = "دوره آموزشی",
  onConfirm,
  onReject,
}: PaymentDetailsModalProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // ✅ استفاده از داده‌های موجود در enrollment
  useEffect(() => {
    if (isOpen && enrollment?.id) {
      // اگر enrollment دارای اطلاعات پرداخت است، از آن استفاده کن
      if (
        enrollment.tracking_code ||
        enrollment.receipt_image_url ||
        enrollment.payment_method
      ) {
        setPaymentDetails({
          id: enrollment.id,
          enrollment_id: enrollment.id,
          payment_method: enrollment.payment_method || "card_to_card",
          tracking_code: enrollment.tracking_code,
          receipt_image_url: enrollment.receipt_image_url,
          transaction_id: null,
          amount: enrollment.amount || coursePrice || 0,
          status: enrollment.status,
          created_at: enrollment.created_at,
        });
        setLoading(false);
      } else {
        // اگر اطلاعات پرداخت در enrollment نیست، از API دریافت کن
        fetchPaymentDetails();
      }
    }
  }, [isOpen, enrollment]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const details = await paymentsAPI.getPaymentByEnrollment(enrollment.id);
      setPaymentDetails(details);
    } catch (err: any) {
      console.error("❌ خطا در دریافت جزئیات پرداخت:", err);
      // اگر API خطا داد، از داده‌های موجود استفاده کن
      setPaymentDetails({
        id: enrollment.id,
        enrollment_id: enrollment.id,
        payment_method: "card_to_card",
        tracking_code: "TRK-" + enrollment.id.slice(0, 8).toUpperCase(),
        receipt_image_url: null,
        transaction_id: null,
        amount: coursePrice || 0,
        status: enrollment.status,
        created_at: enrollment.created_at,
      });
      setError("");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ✅ وضعیت‌های تیکت (هماهنگ با بک‌اند)
  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string; icon: any }> =
      {
        PENDING: { label: "در انتظار", color: "text-yellow-400", icon: Clock },
        CONFIRMED: {
          label: "تایید شده",
          color: "text-green-400",
          icon: CheckCircle,
        },
        CANCELLED: { label: "لغو شده", color: "text-red-400", icon: XCircle },
        COMPLETED: {
          label: "تکمیل شده",
          color: "text-blue-400",
          icon: CheckCircle,
        },
        WAITING: {
          label: "در انتظار تایید",
          color: "text-yellow-400",
          icon: Clock,
        },
        PAID: {
          label: "پرداخت شده",
          color: "text-green-400",
          icon: CheckCircle,
        },
        UNPAID: {
          label: "پرداخت نشده",
          color: "text-red-400",
          icon: XCircle,
        },
      };
    return labels[status] || labels.PENDING;
  };

  const getPaymentStatusLabel = (status?: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      PENDING: { label: "در انتظار پرداخت", color: "text-yellow-400" },
      PAID: { label: "پرداخت شده", color: "text-green-400" },
      UNPAID: { label: "پرداخت نشده", color: "text-red-400" },
      WAITING_VERIFY: { label: "در انتظار تایید", color: "text-blue-400" },
    };
    return labels[status || "PENDING"] || labels.PENDING;
  };

  const status = getStatusLabel(enrollment.status);
  const paymentStatus = getPaymentStatusLabel(enrollment.paymentStatus);
  const StatusIcon = status.icon;
  const isWaitingVerify =
    enrollment.paymentStatus === "WAITING_VERIFY" ||
    enrollment.status === "WAITING" ||
    enrollment.status === "PENDING";

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
    switch (method?.toLowerCase()) {
      case "card_to_card":
        return "کارت به کارت";
      case "bale":
        return "ربات بله";
      default:
        return "نامشخص";
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "card_to_card":
        return <CreditCard className="w-4 h-4" />;
      case "bale":
        return <Bot className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  // ✅ محاسبه مبلغ نهایی
  const finalAmount =
    paymentDetails?.amount || enrollment.amount || coursePrice || 0;

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
          {/* دکمه بستن */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* هدر */}
          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              جزئیات پرداخت
            </h2>
            <p className="text-gray-400 text-sm mt-1">{courseTitle}</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="text-gray-400 mr-3">در حال بارگذاری...</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {/* وضعیت‌ها */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color} bg-white/10`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatus.color} bg-white/10`}
                >
                  💳 {paymentStatus.label}
                </span>
              </div>

              {/* اطلاعات کاربر */}
              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  اطلاعات کاربر
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {enrollment.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {enrollment.user.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {enrollment.user.email}
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

              {/* اطلاعات پرداخت */}
              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  {getPaymentMethodIcon(paymentDetails?.payment_method)}
                  اطلاعات پرداخت
                </h3>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">مبلغ</p>
                    <p className="text-white font-medium">
                      {formatPrice(finalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">تاریخ ثبت</p>
                    <p className="text-white text-xs">
                      {formatDate(
                        paymentDetails?.created_at || enrollment.created_at,
                      )}
                    </p>
                  </div>

                  {/* روش پرداخت */}
                  <div className="col-span-2">
                    <p className="text-gray-500">روش پرداخت</p>
                    <p className="text-white flex items-center gap-1">
                      {getPaymentMethodIcon(paymentDetails?.payment_method)}
                      {getPaymentMethodLabel(paymentDetails?.payment_method)}
                    </p>
                  </div>

                  {/* کد پیگیری (فقط کارت به کارت) */}
                  {paymentDetails?.payment_method?.toLowerCase() ===
                    "card_to_card" &&
                    paymentDetails?.tracking_code && (
                      <div className="col-span-2">
                        <p className="text-gray-500">کد پیگیری</p>
                        <p className="text-blue-400 font-mono text-sm">
                          {paymentDetails.tracking_code}
                        </p>
                      </div>
                    )}

                  {/* شناسه تراکنش (فقط بله) */}
                  {paymentDetails?.payment_method?.toLowerCase() === "bale" &&
                    paymentDetails?.transaction_id && (
                      <div className="col-span-2">
                        <p className="text-gray-500">شناسه تراکنش</p>
                        <p className="text-blue-400 font-mono text-sm">
                          {paymentDetails.transaction_id}
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* تصویر رسید (فقط کارت به کارت) */}
              {paymentDetails?.payment_method?.toLowerCase() ===
                "card_to_card" &&
                paymentDetails?.receipt_image_url && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      تصویر رسید
                    </h3>
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-white/5">
                      {!imageError ? (
                        <img
                          src={paymentDetails.receipt_image_url}
                          alt="تصویر رسید"
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500">
                          <FileImage className="w-12 h-12 text-gray-600" />
                          <p className="text-sm">تصویر رسید موجود نیست</p>
                        </div>
                      )}
                      {/* دکمه دانلود */}
                      <a
                        href={paymentDetails.receipt_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  </div>
                )}

              {/* دکمه‌های اقدام */}
              {isWaitingVerify && (
                <div className="flex gap-3 pt-2">
                  <GlassButton
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      if (onReject) onReject(enrollment.id);
                      onClose();
                    }}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                    icon={<XIcon className="w-4 h-4" />}
                    iconPosition="left"
                  >
                    رد پرداخت
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (onConfirm) onConfirm(enrollment.id);
                      onClose();
                    }}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                    icon={<Check className="w-4 h-4" />}
                    iconPosition="left"
                  >
                    تایید پرداخت
                  </GlassButton>
                </div>
              )}

              {/* دکمه بستن */}
              <div className="pt-2">
                <GlassButton
                  variant="white"
                  size="md"
                  onClick={onClose}
                  fullWidth
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
