import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { coursesAPI } from "../../../lib/api/courses";
import { Plus, Edit, Trash2, Eye, EyeOff, GraduationCap } from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  price: number;
  duration?: string;
  level?: string;
  capacity: number;
  enrolledCount: number;
  eventId?: string;
  event?: {
    title: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  status: string;
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesAPI.getAll();
      setCourses(data.data || data || []);
    } catch (err) {
      setError("خطا در دریافت دوره‌ها");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این دوره مطمئن هستید؟")) return;

    try {
      await coursesAPI.delete(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      alert("خطا در حذف دوره");
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await coursesAPI.update(id, { isActive: !currentStatus });
      setCourses(
        courses.map((c) =>
          c.id === id ? { ...c, isActive: !currentStatus } : c,
        ),
      );
    } catch (err) {
      alert("خطا در تغییر وضعیت");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400">در حال بارگذاری...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-400" />
              دوره‌های آموزشی
            </h1>
            <p className="text-white/60 text-sm">مدیریت دوره‌های آموزشی</p>
          </div>
          <Link to="/admin/courses/create">
            <GlassButton variant="primary" size="md" icon={<Plus size={18} />}>
              دوره جدید
            </GlassButton>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <LiquidGlassCard className="p-12 text-center" borderRadius="16px">
            <GraduationCap className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">هیچ دوره‌ای ثبت نشده است</p>
            <Link to="/admin/courses/create">
              <GlassButton variant="primary" size="sm" className="mt-4">
                افزودن اولین دوره
              </GlassButton>
            </Link>
          </LiquidGlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <LiquidGlassCard
                key={course.id}
                className="p-4"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{course.title}</h3>
                    {course.event && (
                      <p className="text-xs text-blue-400 mt-1">
                        📅 {course.event.title}
                      </p>
                    )}
                    {course.duration && (
                      <p className="text-xs text-gray-400">⏱ {course.duration}</p>
                    )}
                    {course.level && (
                      <p className="text-xs text-gray-400">📚 سطح: {course.level}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          course.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {course.isActive ? "فعال" : "غیرفعال"}
                      </span>
                      {course.isFeatured && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          ⭐ ویژه
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        👥 {course.enrolledCount}/{course.capacity || "∞"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-bold text-blue-400">
                        {course.price === 0 ? "رایگان" : `${course.price.toLocaleString()} تومان`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                  <Link to={`/admin/courses/edit/${course.id}`} className="flex-1">
                    <GlassButton
                      variant="white"
                      size="sm"
                      fullWidth
                      icon={<Edit size={14} />}
                      iconPosition="left"
                    >
                      ویرایش
                    </GlassButton>
                  </Link>
                  <button
                    onClick={() => handleToggleActive(course.id, course.isActive)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title={course.isActive ? "غیرفعال کردن" : "فعال کردن"}
                  >
                    {course.isActive ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
