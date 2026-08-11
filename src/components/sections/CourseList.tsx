import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { coursesAPI } from "../../lib/api/courses";
import { 
  Clock, 
  Users, 
  Award, 
  Loader2, 
  CheckCircle, 
  Calendar,
  Video,
  FileArchive,
  FileText
} from "lucide-react";

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
  sessions?: Session[];
  userEnrolled?: boolean;
}

interface Session {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  meetingLink?: string;
  archiveLink?: string;
  files?: File[];
  isRecorded: boolean;
  isCompleted: boolean;
}

interface File {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

interface CourseListProps {
  eventId: string;
  eventTitle?: string;
}

export default function CourseList({ eventId, eventTitle }: CourseListProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [eventId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesAPI.getByEvent(eventId);
      const coursesWithEnrollment = (data.data || data || []).map((course: Course) => ({
        ...course,
        userEnrolled: checkUserEnrollment(course.id)
      }));
      setCourses(coursesWithEnrollment);
    } catch (err) {
      console.error("❌ خطا:", err);
      setError("خطا در دریافت دوره‌ها");
    } finally {
      setLoading(false);
    }
  };

  const checkUserEnrollment = (courseId: string): boolean => {
    const enrollments = JSON.parse(localStorage.getItem("enrollments") || "[]");
    return enrollments.includes(courseId);
  };

  const handleEnroll = async (courseId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("برای ثبت‌نام باید وارد حساب کاربری خود شوید");
      navigate("/login");
      return;
    }

    setEnrolling(courseId);
    setError("");
    setSuccess("");

    try {
      await coursesAPI.enroll(courseId);
      
      const enrollments = JSON.parse(localStorage.getItem("enrollments") || "[]");
      enrollments.push(courseId);
      localStorage.setItem("enrollments", JSON.stringify(enrollments));
      
      setSuccess("✅ ثبت‌نام با موفقیت انجام شد!");
      
      setCourses(courses.map(c => 
        c.id === courseId 
          ? { ...c, enrolledCount: c.enrolledCount + 1, userEnrolled: true }
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

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const toggleExpand = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
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
        {courses.map((course) => {
          const isExpanded = expandedCourse === course.id;
          const isFull = course.enrolledCount >= course.capacity && course.capacity > 0;
          const isPast = course.endDate && new Date(course.endDate) < new Date();

          return (
            <LiquidGlassCard
              key={course.id}
              className="p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              borderRadius="16px"
              blurIntensity="lg"
              glowIntensity="sm"
              onClick={() => handleCourseClick(course.id)}
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

              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-bold text-white flex-1 line-clamp-2">
                  {course.title}
                </h4>
                {course.isFeatured && (
                  <span className="mr-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full whitespace-nowrap">
                    ⭐ ویژه
                  </span>
                )}
              </div>

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
                  {isFull && (
                    <span className="text-red-400 text-xs">(تکمیل)</span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-white">
                  {formatPrice(course.price)}
                </span>
                {course.userEnrolled ? (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle size={16} />
                    ثبت‌نام شده
                  </span>
                ) : isPast ? (
                  <span className="text-gray-500 text-sm">پایان یافته</span>
                ) : isFull ? (
                  <span className="text-red-400 text-sm">تکمیل ظرفیت</span>
                ) : null}
              </div>

              {!course.userEnrolled && !isPast && !isFull && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
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
              )}

              {course.userEnrolled && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleExpand(course.id)}
                    className="w-full text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center justify-center gap-2 py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg"
                  >
                    {isExpanded ? "بستن جلسات" : "مشاهده جلسات دوره"}
                  </button>
                </div>
              )}

              {isExpanded && course.userEnrolled && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <h5 className="text-sm font-medium text-gray-300 mb-3">جلسات دوره</h5>
                  {course.sessions && course.sessions.length > 0 ? (
                    course.sessions.map((session) => {
                      const isSessionPast = new Date(session.date) < new Date();
                      
                      return (
                        <div key={session.id} className="bg-white/5 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-white">{session.title}</p>
                              {session.description && (
                                <p className="text-xs text-gray-400 mt-1">{session.description}</p>
                              )}
                            </div>
                            {session.isCompleted && (
                              <span className="text-green-400 text-xs flex items-center gap-1">
                                <CheckCircle size={12} />
                                برگزار شده
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(session.date)}
                            </span>
                            {session.time && (
                              <span>⏰ {session.time}</span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {session.isCompleted && session.meetingLink && (
                              <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-full transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Video size={12} />
                                ورود به جلسه
                              </a>
                            )}

                            {isSessionPast && session.archiveLink && (
                              <a
                                href={session.archiveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1 rounded-full transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileArchive size={12} />
                                آرشیو جلسه
                              </a>
                            )}

                            {session.files && session.files.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <FileText size={12} />
                                {session.files.length} فایل
                              </span>
                            )}
                          </div>

                          {session.files && session.files.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {session.files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FileText size={12} />
                                  {file.name}
                                  {file.size && (
                                    <span className="text-gray-500 text-[10px]">
                                      ({Math.round(file.size / 1024)} KB)
                                    </span>
                                  )}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      هنوز جلسه‌ای برای این دوره تعیین نشده است
                    </p>
                  )}
                </div>
              )}
            </LiquidGlassCard>
          );
        })}
      </div>
    </div>
  );
}
