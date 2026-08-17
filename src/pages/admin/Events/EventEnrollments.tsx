// src/pages/admin/Events/EventEnrollments.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { enrollmentsAPI } from "../../../lib/api/enrollments";
import { eventsAPI } from "../../../lib/api/events";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Phone,
  Mail,
  Video,
  ArrowLeft,
  Loader2,
  Filter,
  Download,
} from "lucide-react";

// ✅ تایپ ثبت‌نام مطابق با بک‌اند
interface Enrollment {
  id: string;
  user_id: string;
  event_id?: string;
  course_id?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  payment_status?: "PENDING" | "PAID" | "FAILED";
  meeting_link?: string;
  created_at: string;
  updated_at: string;
  // فیلدهای اضافی برای نمایش
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  event?: {
    id: string;
    title: string;
    date: string;
  };
  // فیلدهای فرم نظرسنجی
  field_of_study?: string;
  university?: string;
  has_experience?: boolean;
  experience_level?: string;
  has_laptop?: boolean;
  os_type?: string;
  goal?: string;
  referral_source?: string;
}

export default function EventEnrollments() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [eventTitle, setEventTitle] = useState("");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchEnrollments();
    fetchEvent();
  }, [eventId, filter]);

  const fetchEvent = async () => {
    try {
      const data = await eventsAPI.getById(eventId!);
      setEventTitle(data.title || "");
    } catch (err) {
      console.error("خطا در دریافت اطلاعات رویداد");
    }
  };

  // ✅ اصلاح: استفاده از getCourseEnrollments به جای getEventEnrollments
  const fetchEnrollments = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError("");

      // ✅ استفاده از getCourseEnrollments برای دریافت ثبت‌نام‌های رویداد
      // توجه: این متد برای دوره‌هاست، اگر رویدادها نیاز به اندپوینت جدا دارند، باید اضافه شود
      // در حال حاضر از getCourseEnrollments استفاده می‌کنیم
      const data = await enrollmentsAPI.getCourseEnrollments(eventId, {
        status: filter === "ALL" ? undefined : filter,
      });

      // ✅ تبدیل داده‌ها به فرمت مورد نیاز
      const mappedData = (data || []).map((item: any) => ({
        ...item,
        payment_status: item.payment_status || item.paymentStatus || "PENDING",
        meeting_link: item.meeting_link || item.meetingLink,
        created_at: item.created_at || item.createdAt,
        user: item.user || {
          id: item.user_id,
          name: item.name || "کاربر",
          phone: item.phone || "",
          email: item.email || "",
        },
      }));

      setEnrollments(mappedData);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.detail || "خطا در دریافت ثبت‌نام‌ها");
    } finally {
      setLoading(false);
    }
  };

  // ✅ اصلاح: تایپ status به صورت Literal
  const updateStatus = async (
    enrollmentId: string,
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
  ) => {
    try {
      await enrollmentsAPI.updateStatus(enrollmentId, status);
      await fetchEnrollments();
    } catch (err) {
      alert("خطا در بروزرسانی وضعیت");
    }
  };

  // ✅ اصلاح: استفاده از setMeetingLink به جای sendMeetingLink
  const handleSendMeetingLink = async () => {
    if (!selectedEnrollment || !meetingLink) return;

    setUpdating(true);
    try {
      await enrollmentsAPI.setMeetingLink(selectedEnrollment.id, meetingLink);
      alert("✅ لینک جلسه با موفقیت ارسال شد");
      setShowMeetingModal(false);
      setMeetingLink("");
      await fetchEnrollments();
    } catch (err) {
      alert("خطا در ارسال لینک جلسه");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; icon: any }> =
      {
        PENDING: {
          label: "در انتظار",
          color: "bg-yellow-500/20 text-yellow-400",
          icon: Clock,
        },
        CONFIRMED: {
          label: "تایید شده",
          color: "bg-green-500/20 text-green-400",
          icon: CheckCircle,
        },
        CANCELLED: {
          label: "لغو شده",
          color: "bg-red-500/20 text-red-400",
          icon: XCircle,
        },
        COMPLETED: {
          label: "تکمیل شده",
          color: "bg-blue-500/20 text-blue-400",
          icon: CheckCircle,
        },
      };
    return badges[status] || badges.PENDING;
  };

  const getPaymentBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      PENDING: { label: "در انتظار پرداخت", color: "text-yellow-400" },
      PAID: { label: "پرداخت شده", color: "text-green-400" },
      FAILED: { label: "ناموفق", color: "text-red-400" },
    };
    return badges[status] || badges.PENDING;
  };

  const exportCSV = () => {
    const headers = [
      "نام",
      "تلفن",
      "ایمیل",
      "وضعیت",
      "وضعیت پرداخت",
      "تاریخ ثبت‌نام",
    ];
    const rows = enrollments.map((e) => [
      e.user?.name || "کاربر",
      e.user?.phone || "",
      e.user?.email || "-",
      getStatusBadge(e.status).label,
      getPaymentBadge(e.payment_status || "PENDING").label,
      new Date(e.created_at || Date.now()).toLocaleDateString("fa-IR"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ثبت‌نام‌های-${eventTitle || "رویداد"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/events")}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-400" />
                  ثبت‌نام‌های رویداد
                </h1>
                <p className="text-white/60 text-sm">
                  {eventTitle || "بدون عنوان"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton
              variant="white"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              iconPosition="left"
              onClick={exportCSV}
              disabled={enrollments.length === 0}
            >
              خروجی CSV
            </GlassButton>
            <div className="text-sm text-white/60">
              {enrollments.length} ثبت‌نام
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="جستجو در ثبت‌نام‌ها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchEnrollments()}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-400/40 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400/40 transition-colors"
            >
              <option value="ALL">همه وضعیت‌ها</option>
              <option value="PENDING">در انتظار</option>
              <option value="CONFIRMED">تایید شده</option>
              <option value="CANCELLED">لغو شده</option>
              <option value="COMPLETED">تکمیل شده</option>
            </select>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
              iconPosition="left"
              onClick={fetchEnrollments}
            >
              فیلتر
            </GlassButton>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            ❌ {error}
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {enrollments.map((enrollment) => {
            const status = getStatusBadge(enrollment.status);
            const payment = getPaymentBadge(
              enrollment.payment_status || "PENDING",
            );
            const StatusIcon = status.icon;

            return (
              <LiquidGlassCard
                key={enrollment.id}
                className="p-4 hover:bg-white/5 transition-all duration-300"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-white font-bold flex items-center gap-2">
                          {enrollment.user?.name || "کاربر"}
                          <span className="text-xs text-white/40 font-normal">
                            #{enrollment.id.slice(0, 8)}
                          </span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-white/60">
                          {enrollment.user?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {enrollment.user.phone}
                            </span>
                          )}
                          {enrollment.user?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {enrollment.user.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(
                              enrollment.created_at || Date.now(),
                            ).toLocaleDateString("fa-IR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${payment.color}`}
                        >
                          {payment.label}
                        </span>
                      </div>
                    </div>

                    {/* اطلاعات فرم نظرسنجی */}
                    {enrollment.field_of_study && (
                      <p className="text-xs text-white/40 mt-1">
                        📚 رشته: {enrollment.field_of_study}
                        {enrollment.university && ` - ${enrollment.university}`}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {enrollment.status === "PENDING" && (
                      <>
                        <GlassButton
                          variant="primary"
                          size="sm"
                          icon={<CheckCircle className="w-3 h-3" />}
                          iconPosition="left"
                          onClick={() =>
                            updateStatus(enrollment.id, "CONFIRMED")
                          }
                        >
                          تایید
                        </GlassButton>
                        <GlassButton
                          variant="white"
                          size="sm"
                          icon={<XCircle className="w-3 h-3" />}
                          iconPosition="left"
                          onClick={() =>
                            updateStatus(enrollment.id, "CANCELLED")
                          }
                        >
                          رد
                        </GlassButton>
                      </>
                    )}
                    {enrollment.status === "CONFIRMED" && (
                      <GlassButton
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle className="w-3 h-3" />}
                        iconPosition="left"
                        onClick={() => updateStatus(enrollment.id, "COMPLETED")}
                      >
                        ثبت حضور
                      </GlassButton>
                    )}
                    {enrollment.payment_status === "PAID" &&
                      enrollment.status !== "COMPLETED" && (
                        <GlassButton
                          variant="white"
                          size="sm"
                          icon={<Video className="w-3 h-3" />}
                          iconPosition="left"
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setMeetingLink(enrollment.meeting_link || "");
                            setShowMeetingModal(true);
                          }}
                        >
                          لینک جلسه
                        </GlassButton>
                      )}
                  </div>
                </div>
              </LiquidGlassCard>
            );
          })}
        </div>

        {enrollments.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-lg">هیچ ثبت‌نامی یافت نشد</p>
            <p className="text-sm text-white/30">
              با تغییر فیلترها یا جستجو، نتیجه را پیدا کنید
            </p>
          </div>
        )}

        {/* Meeting Link Modal */}
        {showMeetingModal && selectedEnrollment && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full animate-in fade-in zoom-in duration-300">
              <LiquidGlassCard
                className="p-6"
                borderRadius="20px"
                blurIntensity="xl"
                glowIntensity="lg"
              >
                <h2 className="text-xl font-bold text-white mb-4 text-center">
                  🔗 ارسال لینک جلسه
                </h2>
                <p className="text-white/60 text-sm text-center mb-4">
                  لینک جلسه را برای "{selectedEnrollment.user?.name || "کاربر"}"
                  ارسال کنید
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      لینک جلسه
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex gap-3">
                    <GlassButton
                      variant="white"
                      size="md"
                      className="flex-1"
                      onClick={() => {
                        setShowMeetingModal(false);
                        setSelectedEnrollment(null);
                        setMeetingLink("");
                      }}
                    >
                      انصراف
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      size="md"
                      className="flex-1"
                      loading={updating}
                      onClick={handleSendMeetingLink}
                      disabled={!meetingLink}
                    >
                      ارسال
                    </GlassButton>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
