// src/pages/admin/Courses/CourseEnrollments.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { coursesAPI } from "../../../lib/api/courses";
import { enrollmentsAPI } from "../../../lib/api/enrollments";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import PaymentDetailsModal from "../../../components/admin/PaymentDetailsModal";
import {
  Users,
  ChevronLeft,
  Download,
  Search,
  Loader2,
  Mail,
  Phone,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  X,
  BookOpen,
  Timer,
  Eye,
} from "lucide-react";
import { toast } from "../../../hooks/use-toast";

// ✅ تایپ کاربر
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// ✅ تایپ ثبت‌نام (مطابق با بک‌اند)
interface Enrollment {
  id: string;
  user_id: string;
  user: User;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "WAITING";
  created_at: string;
  paymentStatus?: "PAID" | "UNPAID" | "PENDING" | "WAITING_VERIFY";
  course_id?: string;
  event_id?: string;
  amount?: number;
  price?: number;
  tracking_code?: string;
  receipt_image_url?: string;
  payment_method?: string;
}

// ✅ تایپ دوره
interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  price: number;
  duration_hours?: number;
  instructor_name?: string;
  is_active: boolean;
  event_id?: string;
  event?: {
    id: string;
    title: string;
  };
  created_at: string;
  updated_at: string;
  capacity?: number;
  enrolledCount?: number;
}

export default function CourseEnrollments() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [, setUpdating] = useState<string | null>(null);

  // ✅ State برای مودال
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchData();
    } else {
      setError("شناسه دوره نامعتبر است");
      setLoading(false);
    }
  }, [courseId]);

  // ✅ تابع دریافت اطلاعات کاربر
  const fetchUserData = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://supremetech.ir/api/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات کاربر");
      }
      return await response.json();
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

  // ✅ تابع تایید پرداخت
  const handleConfirmPayment = async (enrollmentId: string) => {
    if (!confirm("آیا از تایید پرداخت این کاربر مطمئن هستید؟")) return;

    setUpdating(enrollmentId);
    try {
      await enrollmentsAPI.updateStatus(enrollmentId, "CONFIRMED");
      await fetchData();
      toast.success("✅ پرداخت با موفقیت تایید شد!");
    } catch (err) {
      console.error("❌ خطا در تایید پرداخت:", err);
      toast.error("❌ خطا در تایید پرداخت");
    } finally {
      setUpdating(null);
    }
  };

  // ✅ تابع رد پرداخت
  const handleRejectPayment = async (enrollmentId: string) => {
    if (!confirm("آیا از رد پرداخت این کاربر مطمئن هستید؟")) return;

    setUpdating(enrollmentId);
    try {
      await enrollmentsAPI.updateStatus(enrollmentId, "CANCELLED");
      await fetchData();
      toast.success("✅ پرداخت با موفقیت رد شد!");
    } catch (err) {
      console.error("❌ خطا در رد پرداخت:", err);
      toast.error("❌ خطا در رد پرداخت");
    } finally {
      setUpdating(null);
    }
  };

  // ✅ تابع مشاهده جزئیات پرداخت
  const handleViewPaymentDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowPaymentModal(true);
  };

  // ✅ تابع تایید از مودال
  const handleConfirmFromModal = async (enrollmentId: string) => {
    await handleConfirmPayment(enrollmentId);
    setShowPaymentModal(false);
  };

  // ✅ تابع رد از مودال
  const handleRejectFromModal = async (enrollmentId: string) => {
    await handleRejectPayment(enrollmentId);
    setShowPaymentModal(false);
  };

  // ✅ اصلاح fetchData - فقط نمایش کاربران با پرداخت کامل
  const fetchData = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError("");

      const courseData = await coursesAPI.getById(courseId);
      const courseWithFields: Course = {
        ...courseData,
        capacity: (courseData as any).capacity || 0,
        enrolledCount: (courseData as any).enrolledCount || 0,
      };
      setCourse(courseWithFields);

      try {
        const enrollmentsData =
          await enrollmentsAPI.getCourseEnrollments(courseId);

        const mappedEnrollments: Enrollment[] = await Promise.all(
          (enrollmentsData || []).map(async (item: any) => {
            let userData = item.user;
            if (!userData || !userData.name) {
              const userId = item.user_id || item.userId;
              if (userId) {
                userData = await fetchUserData(userId);
              } else {
                userData = {
                  id: userId || "unknown",
                  name: "کاربر ناشناس",
                  email: "ایمیل ثبت نشده",
                  phone: "",
                };
              }
            }

            // ✅ تنظیم paymentStatus بر اساس status
            let paymentStatus =
              item.payment_status || item.paymentStatus || "PENDING";

            if (item.status === "CONFIRMED" || item.status === "COMPLETED") {
              paymentStatus = "PAID";
            } else if (item.status === "WAITING") {
              paymentStatus = "WAITING_VERIFY";
            } else if (item.status === "CANCELLED") {
              paymentStatus = "UNPAID";
            }

            return {
              id: item.id,
              user_id: item.user_id || item.userId || userData.id,
              user: {
                id: userData.id || item.user_id || item.userId,
                name: userData.name || "کاربر ناشناس",
                email: userData.email || "ایمیل ثبت نشده",
                phone: userData.phone || "",
              },
              status: item.status || "PENDING",
              created_at:
                item.created_at || item.createdAt || new Date().toISOString(),
              paymentStatus: paymentStatus,
              course_id: item.course_id || item.courseId,
              event_id: item.event_id || item.eventId,
              amount: item.amount || item.price || 0,
              price: item.price || item.amount || 0,
              tracking_code: item.tracking_code,
              receipt_image_url: item.receipt_image_url,
              payment_method: item.payment_method,
            };
          }),
        );

        // ✅ فقط کاربرانی که پرداخت کامل کرده‌اند (CONFIRMED یا PAID)
        const confirmedEnrollments = mappedEnrollments.filter(
          (enrollment) =>
            enrollment.status === "CONFIRMED" ||
            enrollment.status === "COMPLETED" ||
            enrollment.paymentStatus === "PAID",
        );

        console.log("✅ ثبت‌نام‌های تایید شده:", confirmedEnrollments);
        setEnrollments(confirmedEnrollments);
      } catch (err) {
        console.error("❌ خطا در دریافت ثبت‌نام‌ها:", err);
        setEnrollments([]);
      }
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(
        err.response?.data?.detail || err.message || "خطا در دریافت اطلاعات",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "PENDING":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "CANCELLED":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "COMPLETED":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "WAITING":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "WAITING":
        return <Timer className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "تایید شده";
      case "PENDING":
        return "در انتظار";
      case "CANCELLED":
        return "لغو شده";
      case "COMPLETED":
        return "تکمیل شده";
      case "WAITING":
        return "در انتظار تایید";
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status?: string) => {
    switch (status) {
      case "PAID":
        return "پرداخت شده";
      case "UNPAID":
        return "پرداخت نشده";
      case "PENDING":
        return "در انتظار پرداخت";
      case "WAITING_VERIFY":
        return "در انتظار تایید";
      default:
        return "-";
    }
  };

  const filteredEnrollments = enrollments
    .filter(
      (enrollment) =>
        enrollment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((enrollment) => {
      if (statusFilter === "all") return true;
      return enrollment.status === statusFilter;
    });

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

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-gray-400 mr-3">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-4">
          <h3 className="font-bold mb-1 flex items-center gap-1">
            <X className="w-4 h-4" />
            خطا
          </h3>
          <p>{error || "دوره یافت نشد"}</p>
        </div>
        <Link to="/admin/courses">
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<ChevronLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            بازگشت به لیست دوره‌ها
          </GlassButton>
        </Link>
      </div>
    );
  }

  const enrolledCount = enrollments.length;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* هدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin/courses">
              <GlassButton
                variant="secondary"
                size="sm"
                icon={<ChevronLeft className="w-4 h-4" />}
                iconPosition="left"
              >
                بازگشت
              </GlassButton>
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-3 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            ثبت‌نام‌های تایید شده
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {course.title} - {enrolledCount} نفر ثبت‌نام نهایی شده‌اند
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            iconPosition="left"
            onClick={() => {
              toast.info("📥 قابلیت خروجی گرفتن در حال توسعه است...");
            }}
          >
            خروجی Excel
          </GlassButton>
        </div>
      </div>

      {/* اطلاعات دوره */}
      <LiquidGlassCard
        className="p-4 mb-6"
        borderRadius="12px"
        blurIntensity="sm"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm">عنوان دوره</p>
            <p className="text-white font-medium">{course.title}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">مدرس</p>
            <p className="text-white font-medium">
              {course.instructor_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">تعداد ثبت‌نام‌ها</p>
            <p className="text-white font-medium">{enrolledCount} نفر</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">وضعیت</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                course.is_active
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {course.is_active ? "✅ فعال" : "❌ غیرفعال"}
            </span>
          </div>
        </div>
      </LiquidGlassCard>

      {/* فیلترها */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="جستجوی کاربران بر اساس نام یا ایمیل..."
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
          <option value="all">همه وضعیت‌ها</option>
          <option value="CONFIRMED">✅ تایید شده</option>
          <option value="COMPLETED">📌 تکمیل شده</option>
        </select>
      </div>

      {/* لیست ثبت‌نام‌ها */}
      {filteredEnrollments.length === 0 ? (
        <LiquidGlassCard
          className="p-12 text-center"
          borderRadius="16px"
          blurIntensity="sm"
        >
          <div className="text-6xl mb-4">
            <Users className="w-16 h-16 mx-auto text-white/20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            ثبت‌نامی یافت نشد
          </h3>
          <p className="text-gray-400">
            {searchTerm || statusFilter !== "all"
              ? "با این فیلترها هیچ کاربری یافت نشد"
              : "هیچ کاربری ثبت‌نام نهایی خود را تکمیل نکرده است"}
          </p>
        </LiquidGlassCard>
      ) : (
        <div className="space-y-3">
          {filteredEnrollments.map((enrollment) => {
            return (
              <LiquidGlassCard
                key={enrollment.id}
                className="p-4 hover:scale-[1.01] transition-all duration-300"
                borderRadius="12px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* اطلاعات کاربر */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {enrollment.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          {enrollment.user.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
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

                  {/* وضعیت و تاریخ */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${getStatusColor(enrollment.status)}`}
                    >
                      {getStatusIcon(enrollment.status)}
                      {getStatusLabel(enrollment.status)}
                    </span>
                    {enrollment.paymentStatus && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          enrollment.paymentStatus === "PAID"
                            ? "text-green-400 bg-green-500/20 border-green-500/30"
                            : "text-blue-400 bg-blue-500/20 border-blue-500/30"
                        }`}
                      >
                        💳 {getPaymentStatusLabel(enrollment.paymentStatus)}
                      </span>
                    )}
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(enrollment.created_at)}
                    </span>
                  </div>

                  {/* ✅ دکمه‌های اقدام */}
                  <div className="flex items-center gap-2">
                    {/* دکمه جزئیات - باز کردن مودال */}
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      iconPosition="left"
                      onClick={() => handleViewPaymentDetails(enrollment)}
                    >
                      جزئیات
                    </GlassButton>
                  </div>
                </div>
              </LiquidGlassCard>
            );
          })}
        </div>
      )}

      {/* ✅ مودال جزئیات پرداخت */}
      <PaymentDetailsModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedEnrollment(null);
        }}
        enrollment={{
          id: selectedEnrollment?.id || "",
          user: {
            name: selectedEnrollment?.user?.name || "",
            email: selectedEnrollment?.user?.email || "",
            phone: selectedEnrollment?.user?.phone || "",
          },
          created_at: selectedEnrollment?.created_at || "",
          status: selectedEnrollment?.status || "",
          paymentStatus: selectedEnrollment?.paymentStatus,
          course_id: selectedEnrollment?.course_id,
          event_id: selectedEnrollment?.event_id,
          tracking_code: selectedEnrollment?.tracking_code,
          receipt_image_url: selectedEnrollment?.receipt_image_url,
          payment_method: selectedEnrollment?.payment_method,
          amount: selectedEnrollment?.amount || selectedEnrollment?.price || 0,
        }}
        coursePrice={course?.price || 0}
        courseTitle={course?.title || "دوره آموزشی"}
        onConfirm={handleConfirmFromModal}
        onReject={handleRejectFromModal}
      />
    </div>
  );
}
