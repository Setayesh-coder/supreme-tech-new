// src/pages/profile/Profile.tsx
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api/auth";
import { enrollmentsAPI } from "../../lib/api/enrollments";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import {
  User,
  Phone,
  Mail,
  Edit2,
  LogOut,
  Save,
  X,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Wallet,
  Video,
  ExternalLink,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  createdAt: string;
  isActive: boolean;
}

interface Enrollment {
  id: string;
  eventId: string;
  event: {
    id: string;
    title: string;
    slug: string;
    date: string;
    image?: string;
    price: number;
    meetingLink?: string;
  };
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "WAITING" | "ATTENDED";
  createdAt: string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED";
  meetingLink?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setFormData({
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            phone: parsedUser.phone || "",
          });
        }

        const enrollmentsData = await enrollmentsAPI.getMyEnrollments();
        setEnrollments(enrollmentsData);
      } catch (err) {
        console.error("❌ خطا:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleEdit = () => {
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await authAPI.updateProfile(formData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess("اطلاعات با موفقیت بروزرسانی شد");
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در بروزرسانی");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handlePayment = async (enrollmentId: string) => {
    setShowPayment(true);
    setSelectedEnrollment(
      enrollments.find((e) => e.id === enrollmentId) || null,
    );
  };

  const processPayment = async () => {
    if (!selectedEnrollment) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // پرداخت واقعی با API
      const result = await enrollmentsAPI.processPayment(selectedEnrollment.id);

      if (result.success) {
        setSuccess("✅ پرداخت با موفقیت انجام شد!");
        // به‌روزرسانی لیست
        const updated = await enrollmentsAPI.getMyEnrollments();
        setEnrollments(updated);
        setShowPayment(false);
        setSelectedEnrollment(null);
      } else {
        setError(result.error || "خطا در پرداخت");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در پردازش پرداخت");
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<
      string,
      { label: string; icon: JSX.Element; color: string }
    > = {
      PENDING: {
        label: "در انتظار تایید",
        icon: <AlertCircle size={14} />,
        color: "text-yellow-400",
      },
      CONFIRMED: {
        label: "تایید شده",
        icon: <CheckCircle size={14} />,
        color: "text-green-400",
      },
      CANCELLED: {
        label: "لغو شده",
        icon: <XCircle size={14} />,
        color: "text-red-400",
      },
      WAITING: {
        label: "در لیست انتظار",
        icon: <Clock size={14} />,
        color: "text-orange-400",
      },
      ATTENDED: {
        label: "شرکت کرده",
        icon: <CheckCircle size={14} />,
        color: "text-blue-400",
      },
    };
    return (
      labels[status] || { label: status, icon: null, color: "text-gray-400" }
    );
  };

  const getPaymentStatusLabel = (status?: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      PENDING: { label: "در انتظار پرداخت", color: "text-yellow-400" },
      PAID: { label: "پرداخت شده", color: "text-green-400" },
      FAILED: { label: "ناموفق", color: "text-red-400" },
    };
    return (
      labels[status || "PENDING"] || {
        label: "در انتظار پرداخت",
        color: "text-yellow-400",
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <LiquidGlassCard className="p-8 text-center" borderRadius="32px">
          <p className="text-white">کاربری یافت نشد</p>
          <GlassButton className="mt-4" onClick={() => navigate("/login")}>
            بازگشت به ورود
          </GlassButton>
        </LiquidGlassCard>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-20 px-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* پروفایل */}
        <LiquidGlassCard
          className="p-8"
          borderRadius="32px"
          blurIntensity="lg"
          glowIntensity="md"
          shadowIntensity="lg"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-white/60 text-sm flex items-center gap-1">
                  <Calendar size={14} />
                  عضو از {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400"
            >
              <LogOut size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 text-center">
              ✅ {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                نام کامل
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder:text-white/40 focus:outline-none transition-all duration-200 ${
                    editing
                      ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/50"
                      : "border-white/10 cursor-not-allowed opacity-70"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                شماره تلفن
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder:text-white/40 focus:outline-none transition-all duration-200 ${
                    editing
                      ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/50"
                      : "border-white/10 cursor-not-allowed opacity-70"
                  }`}
                />
              </div>
            </div>

            {user.email && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/60 mb-1">
                  ایمیل
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder:text-white/40 focus:outline-none transition-all duration-200 ${
                      editing
                        ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/50"
                        : "border-white/10 cursor-not-allowed opacity-70"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            {editing ? (
              <>
                <GlassButton
                  variant="primary"
                  size="md"
                  loading={saving}
                  icon={<Save size={18} />}
                  iconPosition="left"
                  onClick={handleSave}
                >
                  ذخیره
                </GlassButton>
                <GlassButton
                  variant="white"
                  size="md"
                  icon={<X size={18} />}
                  iconPosition="left"
                  onClick={handleCancel}
                >
                  انصراف
                </GlassButton>
              </>
            ) : (
              <GlassButton
                variant="primary"
                size="md"
                icon={<Edit2 size={18} />}
                iconPosition="left"
                onClick={handleEdit}
              >
                ویرایش پروفایل
              </GlassButton>
            )}
          </div>
        </LiquidGlassCard>

        {/* دوره‌های ثبت‌نام شده */}
        <div className="mt-8">
          <LiquidGlassCard
            className="p-8"
            borderRadius="32px"
            blurIntensity="lg"
            glowIntensity="md"
            shadowIntensity="lg"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen size={22} className="text-blue-400" />
              دوره‌های من
            </h2>

            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید</p>
                <GlassButton
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate("/events")}
                >
                  مشاهده رویدادها
                </GlassButton>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => {
                  const status = getStatusLabel(enrollment.status);
                  const paymentStatus = getPaymentStatusLabel(
                    enrollment.paymentStatus,
                  );
                  const isPaid = enrollment.paymentStatus === "PAID";
                  const isConfirmed = enrollment.status === "CONFIRMED";
                  const isEventStarted =
                    new Date(enrollment.event.date) <= new Date();

                  return (
                    <LiquidGlassCard
                      key={enrollment.id}
                      className="p-4"
                      borderRadius="16px"
                      blurIntensity="sm"
                      glowIntensity="sm"
                    >
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        {enrollment.event.image ? (
                          <img
                            src={enrollment.event.image}
                            alt={enrollment.event.title}
                            className="w-full md:w-32 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full md:w-32 h-24 bg-white/5 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white/20" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white">
                            {enrollment.event.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(enrollment.event.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Wallet size={14} />
                              {formatPrice(enrollment.event.price)}
                            </span>
                            <span
                              className={`flex items-center gap-1 ${status.color}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                            <span
                              className={`flex items-center gap-1 ${paymentStatus.color}`}
                            >
                              {paymentStatus.label}
                            </span>
                          </div>

                          {/* 🔥 لینک جلسه */}
                          {isConfirmed && isPaid && (
                            <div className="mt-2">
                              {isEventStarted ? (
                                <a
                                  href={
                                    enrollment.meetingLink ||
                                    enrollment.event.meetingLink ||
                                    "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition text-sm"
                                >
                                  <Video size={16} />
                                  ورود به جلسه
                                  <ExternalLink size={14} />
                                </a>
                              ) : (
                                <span className="text-yellow-400 text-sm flex items-center gap-1">
                                  <Clock size={14} />
                                  لینک از{" "}
                                  {new Date(
                                    enrollment.event.date,
                                  ).toLocaleDateString("fa-IR")}{" "}
                                  فعال میشود
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {enrollment.status === "PENDING" &&
                            enrollment.paymentStatus !== "PAID" && (
                              <GlassButton
                                variant="primary"
                                size="sm"
                                icon={<CreditCard size={16} />}
                                iconPosition="left"
                                onClick={() => handlePayment(enrollment.id)}
                              >
                                پرداخت
                              </GlassButton>
                            )}
                          {enrollment.status === "CONFIRMED" && (
                            <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-xl text-sm font-medium">
                              تایید شده
                            </span>
                          )}
                          <GlassButton
                            variant="white"
                            size="sm"
                            onClick={() =>
                              navigate(`/events/${enrollment.event.slug}`)
                            }
                          >
                            مشاهده
                          </GlassButton>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  );
                })}
              </div>
            )}
          </LiquidGlassCard>
        </div>
      </div>

      {/* مودال پرداخت */}
      {showPayment && selectedEnrollment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <LiquidGlassCard
              className="p-8"
              borderRadius="32px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                💳 پرداخت
              </h2>
              <p className="text-gray-400 text-center mb-6">
                آیا از پرداخت مبلغ{" "}
                <span className="text-white font-bold">
                  {formatPrice(selectedEnrollment.event.price)}
                </span>{" "}
                برای دوره "{selectedEnrollment.event.title}" مطمئن هستید؟
              </p>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">دوره</span>
                    <span className="text-white">
                      {selectedEnrollment.event.title}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-400">مبلغ</span>
                    <span className="text-white font-bold">
                      {formatPrice(selectedEnrollment.event.price)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-center">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl text-center">
                    ✅ {success}
                  </div>
                )}

                <div className="flex gap-3">
                  <GlassButton
                    variant="white"
                    size="md"
                    className="flex-1"
                    onClick={() => {
                      setShowPayment(false);
                      setSelectedEnrollment(null);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    انصراف
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    size="md"
                    className="flex-1"
                    loading={saving}
                    onClick={processPayment}
                  >
                    پرداخت
                  </GlassButton>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      )}
    </section>
  );
}
