import { useState, useEffect } from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { coursesAPI } from "../../lib/api/courses";
import {  Clock, Users, Award, Loader2, CheckCircle } from "lucide-react";

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
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface CourseListProps {
  eventId: string;
  eventTitle?: string;
}

export default function CourseList({ eventId, eventTitle }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCourses();
  }, [eventId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesAPI.getByEvent(eventId);
      setCourses(data.data || data || []);
    } catch (err) {
      console.error("❌ خطا:", err);
      setError("خطا در دریافت دوره‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("برای ثبت‌نام باید وارد حساب کاربری خود شوید");
      window.location.href = "/login";
      return;
    }

    setEnrolling(courseId);
    setError("");
    setSuccess("");

    try {
      await coursesAPI.enroll(courseId);
      setSuccess("✅ ثبت‌نام با موفقیت انجام شد!");
      
      // به‌روزرسانی تعداد ثبت‌نام‌ها
      setCourses(courses.map(c => 
        c.id === courseId 
          ? { ...c, enrolledCount: c.enrolledCount + 1 }
          : c
      ));
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در ثبت‌نام");
      setTimeout(() => setError(""), 3000);
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="text-gray-400 mr-3">در حال بارگذاری دوره‌ها...</span>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Award className="w-6 h-6 text-blue-400" />
        دوره‌های آموزشی این رویداد
        {eventTitle && <span className="text-lg text-gray-400">({eventTitle})</span>}
      </h3>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <LiquidGlassCard
            key={course.id}
            className="p-6 hover:scale-105 transition-all duration-300"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="sm"
          >
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}

            <h4 className="text-lg font-bold text-white mb-2">
              {course.title}
            </h4>

            {course.description && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {course.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-400">
              {course.duration && (
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>مدت: {course.duration}</span>
                </div>
              )}
              {course.level && (
                <div className="flex items-center gap-2">
                  <span>📚 سطح: {course.level}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span>
                  {course.enrolledCount} / {course.capacity || "نامحدود"} نفر
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>💰 قیمت: {course.price === 0 ? "رایگان" : `${course.price.toLocaleString()} تومان`}</span>
              </div>
            </div>

            {course.isFeatured && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                ⭐ ویژه
              </span>
            )}

            <div className="mt-4">
              <GlassButton
                variant="primary"
                size="sm"
                fullWidth
                loading={enrolling === course.id}
                onClick={() => handleEnroll(course.id)}
                icon={enrolling === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
                iconPosition="left"
              >
                {enrolling === course.id ? "در حال ثبت‌نام..." : "ثبت‌نام در دوره"}
              </GlassButton>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  );
}
