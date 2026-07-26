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
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Video,
  ArrowLeft,
  Loader2,
  Filter,
  Download,
} from "lucide-react";

interface Enrollment {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "WAITING" | "ATTENDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
  meetingLink?: string;
  notes?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  event: {
    id: string;
    title: string;
    date: string;
  };
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

  const fetchEnrollments = async () => {
    try {
      const data = await enrollmentsAPI.getEventEnrollments(eventId!, {
        status: filter === "ALL" ? undefined : filter,
        search: search || undefined,
      });
      setEnrollments(data || []);
    } catch (err) {
      setError("خطا در دریافت ثبت‌نام‌ها");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (enrollmentId: string, status: string) => {
    try {
      await enrollmentsAPI.updateStatus(enrollmentId, status);
      await fetchEnrollments();
    } catch (err) {
      alert("خطا در بروزرسانی وضعیت");
    }
  };

  const handleSendMeetingLink = async () => {
    if (!selectedEnrollment || !meetingLink) return;

    setUpdating(true);
    try {
      await enrollmentsAPI.sendMeetingLink(selectedEnrollment.id, meetingLink);
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
        WAITING: {
          label: "در لیست انتظار",
          color: "bg-orange-500/20 text-orange-400",
          icon: AlertCircle,
        },
        ATTENDED: {
          label: "حضور یافته",
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
      e.user?.name || e.name,
      e.user?.phone || e.phone,
      e.user?.email || e.email || "-",
      getStatusBadge(e.status).label,
      getPaymentBadge(e.paymentStatus).label,
      new Date(e.createdAt).toLocaleDateString("fa-IR"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ثبت‌نام‌های-${eventTitle}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
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
              <option value="ATTENDED">حضور یافته</option>
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
            {error}
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {enrollments.map((enrollment) => {
            const status = getStatusBadge(enrollment.status);
            const payment = getPaymentBadge(enrollment.paymentStatus);
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
                          {enrollment.user?.name || enrollment.name}
                          <span className="text-xs text-white/40 font-normal">
                            #{enrollment.id.slice(0, 8)}
                          </span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {enrollment.user?.phone || enrollment.phone}
                          </span>
                          {enrollment.user?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {enrollment.user.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(enrollment.createdAt).toLocaleDateString(
                              "fa-IR",
                            )}
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

                    {enrollment.notes && (
                      <p className="text-xs text-white/40 mt-1">
                        📝 {enrollment.notes}
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
                        onClick={() => updateStatus(enrollment.id, "ATTENDED")}
                      >
                        ثبت حضور
                      </GlassButton>
                    )}
                    {enrollment.paymentStatus === "PAID" &&
                      enrollment.status !== "ATTENDED" && (
                        <GlassButton
                          variant="white"
                          size="sm"
                          icon={<Video className="w-3 h-3" />}
                          iconPosition="left"
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setMeetingLink(enrollment.meetingLink || "");
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
                  لینک جلسه را برای "
                  {selectedEnrollment.user?.name || selectedEnrollment.name}"
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
