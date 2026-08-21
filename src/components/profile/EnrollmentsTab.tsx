import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import {
  BookOpen,
  Calendar,
  Wallet,
  CreditCard,
  Video,
  Clock,
} from "lucide-react";

interface Enrollment {
  id: string;
  eventId: string;
  course_id?: string;
  event: {
    id: string;
    title: string;
    slug: string;
    date: string;
    image?: string;
    price: number;
    duration?: string;
    meetingLink?: string;
  };
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "WAITING" | "ATTENDED";
  createdAt: string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "WAITING_VERIFY";
  meetingLink?: string;
}

interface EnrollmentsTabProps {
  enrollments: Enrollment[];
  navigate: (path: string) => void;
  formatDate: (date: string) => string;
  formatPrice: (price: number) => string;
  getStatusLabel: (status: string) => {
    label: string;
    icon: React.ReactElement;
    color: string;
  };
  getPaymentStatusLabel: (status?: string) => { label: string; color: string };
  handlePayment: (id: string) => void; // ✅ این تابع کاربر را به صفحه پرداخت هدایت می‌کند
}

export function EnrollmentsTab({
  enrollments,
  navigate,
  formatDate,
  formatPrice,
  getStatusLabel,
  getPaymentStatusLabel,
  handlePayment,
}: EnrollmentsTabProps) {
  if (enrollments.length === 0) {
    return (
      <LiquidGlassCard
        className="p-8 flex flex-col items-center justify-center min-h-[300px]"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400 mb-6 text-center">
          هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید
        </p>
        <GlassButton
          variant="primary"
          onClick={() => navigate("/events")}
          className="mx-auto"
        >
          مشاهده رویدادها
        </GlassButton>
      </LiquidGlassCard>
    );
  }

  return (
    <LiquidGlassCard
      className="p-6"
      borderRadius="20px"
      blurIntensity="lg"
      glowIntensity="md"
    >
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-blue-400" />
        دوره‌های من
        <span className="text-sm text-gray-400 font-normal mr-2">
          ({enrollments.length})
        </span>
      </h2>

      <div className="space-y-3">
        {enrollments.map((enrollment) => {
          const status = getStatusLabel(enrollment.status);
          const paymentStatus = getPaymentStatusLabel(enrollment.paymentStatus);
          const isPaid = enrollment.paymentStatus === "PAID";
          const isConfirmed = enrollment.status === "CONFIRMED";
          const isEventStarted = new Date(enrollment.event.date) <= new Date();
          const isWaitingVerify = enrollment.paymentStatus === "WAITING_VERIFY";

          return (
            <LiquidGlassCard
              key={enrollment.id}
              className="p-4 hover:bg-white/5 transition-all duration-300"
              borderRadius="14px"
              blurIntensity="sm"
              glowIntensity="sm"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* تصویر */}
                <div className="w-full md:w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  {enrollment.event.image ? (
                    <img
                      src={enrollment.event.image}
                      alt={enrollment.event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                </div>

                {/* اطلاعات */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white truncate">
                      {enrollment.event.title}
                    </h3>
                    <span
                      className={`text-xs font-medium ${status.color} flex items-center gap-1`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(enrollment.event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      {formatPrice(enrollment.event.price)}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${paymentStatus.color}`}
                    >
                      {paymentStatus.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* ✅ دکمه پرداخت - هدایت به صفحه پرداخت */}
                    // src/components/profile/EnrollmentsTab.tsx
                    {enrollment.status === "PENDING" &&
                      enrollment.paymentStatus !== "PAID" &&
                      !isWaitingVerify && (
                        <GlassButton
                          variant="primary"
                          size="sm"
                          icon={<CreditCard className="w-3 h-3" />}
                          iconPosition="left"
                          onClick={() => {
                            // ✅ استفاده از enrollment.id (که همان enrollment_id در بک‌اند است)
                            const paymentId = enrollment.id;

                            if (!paymentId) {
                              alert("خطا: شناسه ثبت‌نام نامعتبر است");
                              return;
                            }

                            handlePayment(paymentId);
                          }}
                        >
                          پرداخت
                        </GlassButton>
                      )}
                    {/* ✅ وضعیت در انتظار تایید */}
                    {isWaitingVerify && (
                      <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-xl text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        در انتظار تایید
                      </span>
                    )}
                    {/* ✅ ورود به جلسه */}
                    {isConfirmed && isPaid && isEventStarted && (
                      <a
                        href={
                          enrollment.meetingLink ||
                          enrollment.event.meetingLink ||
                          "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition text-xs font-medium"
                      >
                        <Video className="w-3 h-3" />
                        ورود به جلسه
                      </a>
                    )}
                    {/* ✅ دکمه جزئیات */}
                    <GlassButton
                      variant="white"
                      size="sm"
                      onClick={() =>
                        navigate(`/events/${enrollment.event.slug}`)
                      }
                    >
                      جزئیات
                    </GlassButton>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </LiquidGlassCard>
  );
}
