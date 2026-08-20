// src/pages/admin/Courses/CourseList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { coursesAPI } from "../../../lib/api/courses";
import {
  Loader2,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";

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
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const pageSize = 12;

  useEffect(() => {
    fetchCourses();
  }, [currentPage, filterStatus]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesAPI.getAll({
        page: currentPage,
        limit: pageSize,
        isActive:
          filterStatus !== "all" ? filterStatus === "active" : undefined,
      });

      setCourses(data.items || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("❌ خطا:", err);
      setError("خطا در دریافت دوره‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این دوره مطمئن هستید؟")) return;
    try {
      await coursesAPI.delete(id);
      setCourses(courses.filter((c) => c.id !== id));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      alert("خطا در حذف دوره");
    }
  };

  const handleImageError = (courseId: string) => {
    setImageErrors((prev) => ({ ...prev, [courseId]: true }));
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(totalCount / pageSize);

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ========== هدر ========== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-400" />
              مدیریت دوره‌ها
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {totalCount} دوره آموزشی در سیستم
            </p>
          </div>
          <Link to="/admin/courses/create">
            <GlassButton
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              دوره جدید
            </GlassButton>
          </Link>
        </div>

        {/* ========== جستجو و فیلتر ========== */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در عنوان، توضیحات یا نام مدرس..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
          >
            <option value="all">همه دوره‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </div>

        {/* ========== خطا ========== */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            <X /> {error}
          </div>
        )}

        {/* ========== لیست دوره‌ها ========== */}
        {filteredCourses.length === 0 ? (
          <LiquidGlassCard
            className="p-12 text-center"
            borderRadius="16px"
            blurIntensity="sm"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm ? "دوره‌ای یافت نشد" : "هنوز دوره‌ای ایجاد نشده است"}
            </h3>
            <p className="text-gray-400">
              {searchTerm
                ? "با عبارت دیگری جستجو کنید"
                : "برای شروع، اولین دوره را ایجاد کنید"}
            </p>
            {!searchTerm && (
              <Link to="/admin/courses/create">
                <GlassButton variant="primary" className="mt-4">
                  ایجاد اولین دوره
                </GlassButton>
              </Link>
            )}
          </LiquidGlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const hasError = imageErrors[course.id];

              return (
                <LiquidGlassCard
                  key={course.id}
                  className="p-4 hover:scale-[1.02] transition-all duration-300"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                >
                  {/* ===== تصویر ===== */}
                  <div className="relative w-full h-40 rounded-lg overflow-hidden bg-white/5 mb-3">
                    {course.cover_image && !hasError ? (
                      <img
                        src={course.cover_image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(course.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                        <BookOpen className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                          course.is_active
                            ? "bg-green-500/90 text-white"
                            : "bg-red-500/90 text-white"
                        }`}
                      >
                        {course.is_active ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {course.is_active ? "فعال" : "غیرفعال"}
                      </span>
                    </div>
                  </div>

                  {/* ===== عنوان و توضیحات ===== */}
                  <h3 className="text-white font-bold text-lg line-clamp-1">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                      {course.description}
                    </p>
                  )}

                  {/* ===== اطلاعات ===== */}
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">قیمت</span>
                      <span className="text-white font-medium">
                        {formatPrice(course.price)}
                      </span>
                    </div>

                    {course.instructor_name && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          مدرس
                        </span>
                        <span className="text-white">
                          {course.instructor_name}
                        </span>
                      </div>
                    )}

                    {course.duration_hours && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          مدت
                        </span>
                        <span className="text-white">
                          {course.duration_hours} ساعت
                        </span>
                      </div>
                    )}

                    {course.event && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          رویداد
                        </span>
                        <span className="text-blue-400 text-sm truncate max-w-[120px]">
                          {course.event.title}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>ایجاد</span>
                      <span>{formatDate(course.created_at)}</span>
                    </div>
                  </div>

                  {/* ===== دکمه‌ها ===== */}
                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-white/10">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/courses/edit/${course.id}`}
                        className="flex-1"
                      >
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          fullWidth
                          icon={<Edit className="w-3.5 h-3.5" />}
                          iconPosition="left"
                        >
                          ویرایش
                        </GlassButton>
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center justify-center min-w-[38px]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link to={`/admin/courses/enrollments/${course.id}`}>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        fullWidth
                        icon={<Users className="w-3.5 h-3.5" />}
                        iconPosition="left"
                      >
                        مشاهده ثبت‌نام‌ها
                      </GlassButton>
                    </Link>
                  </div>
                </LiquidGlassCard>
              );
            })}
          </div>
        )}

        {/* ========== صفحه‌بندی ========== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              قبلی
            </button>
            <span className="text-white px-4 py-2 text-sm">
              صفحه {currentPage} از {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
