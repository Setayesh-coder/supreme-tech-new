import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { coursesAPI } from "../../../lib/api/courses";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { 
  Users, 
  ChevronLeft,
  Download,
  Search,
  Loader2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

interface Enrollment {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  paymentStatus?: "PAID" | "UNPAID" | "PENDING";
}

interface Course {
  id: string;
  title: string;
  slug: string;
  capacity: number;
  enrolledCount: number;
  price: number;
}

export default function CourseEnrollments() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // دریافت اطلاعات دوره
      const courseData = await coursesAPI.getById(courseId!);
      setCourse(courseData.data || courseData);

      // دریافت لیست ثبت‌نام‌ها - استفاده از API صحیح
      try {
        // اگر API خاصی برای دریافت ثبت‌نام‌های دوره وجود ندارد، از getAll استفاده می‌کنیم
        const allData = await coursesAPI.getAll({ limit: 100 });
        const allCourses = allData.data || allData || [];
        const foundCourse = allCourses.find((c: any) => c.id === courseId);
        if (foundCourse && foundCourse.enrollments) {
          setEnrollments(foundCourse.enrollments);
        } else {
          // اگر enrollments در پاسخ نبود، یک آرایه خالی می‌گذاریم
          setEnrollments([]);
        }
      } catch (err) {
        console.error("خطا در دریافت ثبت‌نام‌ها:", err);
        setEnrollments([]);
      }
    } catch (err) {
      setError("خطا در دریافت اطلاعات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-400 bg-green-500/20";
      case "PENDING":
        return "text-yellow-400 bg-yellow-500/20";
      case "CANCELLED":
        return "text-red-400 bg-red-500/20";
      case "COMPLETED":
        return "text-blue-400 bg-blue-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
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
      default:
        return "-";
    }
  };

  const filteredEnrollments = enrollments
    .filter(enrollment => 
      enrollment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(enrollment => {
      if (statusFilter === "all") return true;
      return enrollment.status === statusFilter;
    });

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="text-gray-400 mr-3">در حال بارگذاری...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg">
          ❌ {error || "دوره یافت نشد"}
        </div>
        <Link to="/admin/courses" className="mt-4 inline-block">
          <GlassButton variant="secondary" size="sm">
            بازگشت به لیست دوره‌ها
          </GlassButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* هدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin/courses">
              <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              ثبت‌نام‌های دوره
            </h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {course.title} - {course.enrolledCount} / {course.capacity} نفر
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            iconPosition="left"
            onClick={() => {
              alert("در حال توسعه...");
            }}
          >
            خروجی
          </GlassButton>
        </div>
      </div>

      {/* فیلترها */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="جستجوی کاربران..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="CONFIRMED">تایید شده</option>
          <option value="PENDING">در انتظار</option>
          <option value="CANCELLED">لغو شده</option>
          <option value="COMPLETED">تکمیل شده</option>
        </select>
      </div>

      {/* لیست ثبت‌نام‌ها */}
      {filteredEnrollments.length === 0 ? (
        <LiquidGlassCard className="p-12 text-center" borderRadius="16px" blurIntensity="sm">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-bold text-white mb-2">ثبت‌نامی یافت نشد</h3>
          <p className="text-gray-400">هنوز کاربری در این دوره ثبت‌نام نکرده است</p>
        </LiquidGlassCard>
      ) : (
        <div className="space-y-3">
          {filteredEnrollments.map((enrollment) => (
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
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{enrollment.user.name}</h4>
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
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                    {getStatusLabel(enrollment.status)}
                  </span>
                  {enrollment.paymentStatus && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      enrollment.paymentStatus === "PAID" 
                        ? "text-green-400 bg-green-500/20"
                        : enrollment.paymentStatus === "UNPAID"
                          ? "text-red-400 bg-red-500/20"
                          : "text-yellow-400 bg-yellow-500/20"
                    }`}>
                      {getPaymentStatusLabel(enrollment.paymentStatus)}
                    </span>
                  )}
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(enrollment.createdAt)}
                  </span>
                </div>

                {/* دکمه‌های اقدام */}
                <div className="flex items-center gap-2">
                  <Link to={`/admin/users/${enrollment.userId}`}>
                    <GlassButton variant="secondary" size="sm">
                      مشاهده کاربر
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
