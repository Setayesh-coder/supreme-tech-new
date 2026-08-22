// src/components/admin/PaymentDetailsModal.tsx
import { useState } from "react";
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
} from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";

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
  };
  coursePrice?: number;
  courseTitle?: string;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  enrollment,
  coursePrice,
  courseTitle,
  onConfirm,
  onReject,
}: PaymentDetailsModalProps) {
  const [imageError, setImageError] = useState(false);
  const [loading] = useState(false);

  if (!isOpen) return null;

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
  const isWaitingVerify = enrollment.paymentStatus === "WAITING_VERIFY";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return "نامشخص";
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  // ✅ شناسه پیگیری نمونه (از بک‌اند دریافت نمی‌شود)
  // در آینده که API اضافه شد، از آن استفاده کنید
  const trackingCode = "TRK-" + enrollment.id.slice(0, 8).toUpperCase();

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
                <h3 className="text-sm font-medium text-gray-400 mb-2">
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
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  اطلاعات پرداخت
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">مبلغ</p>
                    <p className="text-white font-medium">
                      {formatPrice(coursePrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">تاریخ ثبت</p>
                    <p className="text-white text-xs">
                      {formatDate(enrollment.created_at)}
                    </p>
                  </div>

                  {/* کد پیگیری */}
                  <div className="col-span-2">
                    <p className="text-gray-500">کد پیگیری</p>
                    <p className="text-blue-400 font-mono text-sm">
                      {trackingCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* تصویر رسید - نمونه */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  تصویر رسید
                </h3>
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-white/5">
                  {!imageError ? (
                    <img
                      src="/placeholder-receipt.jpg"
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
                  <button
                    onClick={() => {
                      alert("📥 قابلیت دانلود در حال توسعه است...");
                    }}
                    className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

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
