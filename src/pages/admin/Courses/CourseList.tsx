import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { coursesAPI } from "../../../lib/api/courses";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Users
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  price: number;
  duration?: string;
  level?: string;
  capacity: number;
  enrolledCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isFeatured: boolean;
  event?: {
    id: string;
    title: string;
  };
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesAPI.getAll({ limit: 100 });
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
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      alert("خطا در حذف دوره");
      console.error(err);
    }
  };

  const filteredCourses = courses
    .filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(course => {
      if (filterStatus === "active") return course.isActive;
      if (filterStatus === "inactive") return !course.isActive;
      return true;
    });

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  return (
    <div className="p-4 md:p-6">
      {/* هدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">مدیریت دوره‌ها</h1>
          <p className="text-gray-400 text-sm mt-1">مدیریت و مشاهده تمام دوره‌های آموزشی</p>
        </div>
        <Link to="/admin/courses/create">
          <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />} iconPosition="left">
            ایجاد دوره جدید
          </GlassButton>
        </Link>
      </div>

      {/* فیلترها */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="جستجوی دوره‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">همه</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
          ❌ {error}
        </div>
      )}

      {/* لیست دوره‌ها */}
      {filteredCourses.length === 0 ? (
        <LiquidGlassCard className="p-12 text-center" borderRadius="16px" blurIntensity="sm">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-white mb-2">دوره‌ای یافت نشد</h3>
          <p className="text-gray-400">هنوز دوره‌ای ایجاد نشده است</p>
        </LiquidGlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <LiquidGlassCard
              key={course.id}
              className="p-4 hover:scale-[1.02] transition-all duration-300"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
            >
              {/* تصویر */}
              {course.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}

              {/* عنوان و وضعیت */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white flex-1 line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex items-center gap-1 mr-2">
                  {course.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>

              {/* توضیحات */}
              {course.description && (
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {course.description}
                </p>
              )}

              {/* اطلاعات */}
              <div className="space-y-1.5 text-sm text-gray-400">
                <div className="flex items-center justify-between">
                  <span>قیمت</span>
                  <span className="text-white font-medium">{formatPrice(course.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ظرفیت</span>
                  <span className="text-white">
                    {course.enrolledCount} / {course.capacity} نفر
                  </span>
                </div>
                {course.duration && (
                  <div className="flex items-center justify-between">
                    <span>مدت</span>
                    <span className="text-white">{course.duration}</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex items-center justify-between">
                    <span>سطح</span>
                    <span className="text-white">{course.level}</span>
                  </div>
                )}
                {course.event && (
                  <div className="flex items-center justify-between">
                    <span>رویداد</span>
                    <span className="text-blue-400 text-sm">{course.event.title}</span>
                  </div>
                )}
                {course.startDate && (
                  <div className="flex items-center justify-between">
                    <span>شروع</span>
                    <span className="text-white">{formatDate(course.startDate)}</span>
                  </div>
                )}
              </div>

              {/* دکمه‌ها */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Link to={`/admin/courses/edit/${course.id}`} className="flex-1">
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      fullWidth
                      icon={<Edit className="w-4 h-4" />}
                      iconPosition="left"
                    >
                      ویرایش
                    </GlassButton>
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* دکمه مشاهده ثبت‌نام‌ها */}
                <Link to={`/admin/courses/enrollments/${course.id}`}>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={<Users className="w-4 h-4" />}
                    iconPosition="left"
                  >
                    مشاهده ثبت‌نام‌ها ({course.enrolledCount})
                  </GlassButton>
                </Link>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
