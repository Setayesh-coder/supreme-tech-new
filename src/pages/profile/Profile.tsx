// src/pages/profile/Profile.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api/auth";
import { enrollmentsAPI } from "../../lib/api/enrollments";
import { ticketsAPI } from "../../lib/api/tickets";
import { messagesAPI } from "../../lib/api/messages";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import {
  ProfileHeader,
  ProfileStats,
  ProfileTabs,
  ProfileInfo,
  EnrollmentsTab,
  CartTab,
  TicketsTab,
  PaymentModal,
} from "../../components/profile";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  MessageSquare,
  Mail,
} from "lucide-react";

// ============== Interfaces ==============
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
    duration?: string;
    meetingLink?: string;
  };
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "WAITING" | "ATTENDED";
  createdAt: string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED";
  meetingLink?: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  category: string;
}

interface MessageReply {
  id: string;
  messageId: string;
  message: {
    subject: string;
    message: string;
    createdAt: string;
  };
  reply: string;
  sentAt: string;
}

// ============================================================
// 🔥 کامپوننت پاسخ‌های پیام‌ها
// ============================================================
function RepliesTab({
  replies,
  loading,
  formatDate,
}: {
  replies: MessageReply[];
  loading: boolean;
  formatDate: (date: string) => string;
}) {
  if (loading) {
    return (
      <LiquidGlassCard
        className="p-8 text-center"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
        <p className="text-gray-400 mt-4">دریافت پاسخ‌ها...</p>
      </LiquidGlassCard>
    );
  }

  if (replies.length === 0) {
    return (
      <LiquidGlassCard
        className="p-8 text-center"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <Mail className="w-16 h-16 mx-auto mb-4 text-white/20" />
        <p className="text-gray-400">هنوز پاسخی دریافت نکرده‌اید</p>
        <p className="text-gray-500 text-sm mt-1">
          پاسخ به پیام‌های شما در این بخش نمایش داده می‌شود
        </p>
      </LiquidGlassCard>
    );
  }

  return (
    <LiquidGlassCard
      className="p-6"
      borderRadius="20px"
      blurIntensity="lg"
      glowIntensity="md"
    >
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        پاسخ‌های تیم
        <span className="text-sm text-gray-400 font-normal mr-2">
          ({replies.length})
        </span>
      </h2>

      <div className="space-y-4">
        {replies.map((reply) => (
          <LiquidGlassCard
            key={reply.id}
            className="p-4 hover:bg-white/5 transition-all duration-300"
            borderRadius="14px"
            blurIntensity="sm"
            glowIntensity="sm"
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-bold">
                  {reply.message.subject}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatDate(reply.sentAt)}
                </span>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-gray-400 text-sm">
                  <span className="text-gray-500">پیام شما:</span>
                  <br />
                  {reply.message.message}
                </p>
              </div>

              <div className="bg-blue-500/10 rounded-xl p-3 border-r-2 border-blue-400">
                <p className="text-white text-sm">
                  <span className="text-blue-400">پاسخ تیم:</span>
                  <br />
                  {reply.reply}
                </p>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </LiquidGlassCard>
  );
}

// ============== Main Component ==============
export default function Profile() {
  const navigate = useNavigate();

  // ============== States ==============
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [cart, setCart] = useState<Enrollment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<MessageReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
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
  const [activeTab, setActiveTab] = useState<
    "enrollments" | "cart" | "tickets" | "replies"
  >("enrollments");
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ============== 🔥 توابع قبل از useEffect ==============
  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ توکن وجود ندارد");
        setTickets([]);
        return;
      }

      const data = await ticketsAPI.getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ خطا در دریافت تیکت‌ها:", err);
      if (err.status === 403 || err.status === 404) {
        console.warn("⚠️ دسترسی به تیکت‌ها مجاز نیست، آرایه خالی برگردانده شد");
        setTickets([]);
      } else {
        setError("خطا در دریافت تیکت‌ها");
      }
    } finally {
      setTicketsLoading(false);
    }
  };

  // 🔥 دریافت پاسخ‌های پیام‌ها
  const fetchReplies = async () => {
    if (!user?.id) return;
    setRepliesLoading(true);
    try {
      const data = await messagesAPI.getUserReplies(user.id);
      setReplies(data || []);
    } catch (err) {
      console.error("❌ خطا در دریافت پاسخ‌ها:", err);
    } finally {
      setRepliesLoading(false);
    }
  };

  // ============== useEffect ==============
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

        const pending = enrollmentsData.filter(
          (e: any) => e.paymentStatus === "PENDING",
        );
        setCart(pending);

        await fetchTickets();
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

  // ============== Fetch Replies after user is set ==============
  useEffect(() => {
    if (user?.id) {
      fetchReplies();
    }
  }, [user?.id]);

  // ============== 🔥 Profile Functions ==============
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
    if (confirm("آیا از خروج از حساب کاربری مطمئن هستید؟")) {
      authAPI.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // ============== Payment Functions ==============
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
      const result = await enrollmentsAPI.processPayment(selectedEnrollment.id);

      if (result.success) {
        setSuccess("✅ پرداخت با موفقیت انجام شد!");
        const updated = await enrollmentsAPI.getMyEnrollments();
        setEnrollments(updated);
        setCart(updated.filter((e: any) => e.paymentStatus === "PENDING"));
        setShowPayment(false);
        setSelectedEnrollment(null);
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(result.error || "خطا در پرداخت");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در پردازش پرداخت");
    } finally {
      setSaving(false);
    }
  };

  // ============== Cart Functions ==============
  const handleCartPayment = async (enrollmentId: string) => {
    setProcessingId(enrollmentId);
    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const result = await enrollmentsAPI.processPayment(enrollmentId);
      if (result.success) {
        setSuccess("✅ پرداخت با موفقیت انجام شد!");
        const updated = await enrollmentsAPI.getMyEnrollments();
        setEnrollments(updated);
        setCart(updated.filter((e: any) => e.paymentStatus === "PENDING"));
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(result.error || "خطا در پرداخت");
      }
    } catch (err) {
      setError("خطا در پردازش پرداخت");
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
  };

  const handleRemoveFromCart = async (enrollmentId: string) => {
    if (!confirm("آیا از حذف این آیتم از سبد خرید مطمئن هستید؟")) return;

    try {
      setCart(cart.filter((item) => item.id !== enrollmentId));
      setSuccess("✅ آیتم از سبد خرید حذف شد");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("خطا در حذف آیتم");
    }
  };

  const handlePayAll = async () => {
    if (cart.length === 0) return;

    const totalPrice = cart.reduce((sum, item) => sum + item.event.price, 0);
    if (
      !confirm(
        `آیا از پرداخت مبلغ ${totalPrice.toLocaleString()} تومان برای ${cart.length} دوره مطمئن هستید؟`,
      )
    ) {
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      for (const item of cart) {
        const result = await enrollmentsAPI.processPayment(item.id);
        if (!result.success) {
          setError(`خطا در پرداخت دوره "${item.event.title}"`);
          setProcessing(false);
          return;
        }
      }

      setSuccess(`✅ پرداخت ${cart.length} دوره با موفقیت انجام شد!`);
      const updated = await enrollmentsAPI.getMyEnrollments();
      setEnrollments(updated);
      setCart(updated.filter((e: any) => e.paymentStatus === "PENDING"));
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("خطا در پردازش پرداخت‌ها");
    } finally {
      setProcessing(false);
    }
  };

  // ============== Ticket Functions ==============
  const handleCreateTicket = () => {
    navigate("/tickets/create");
  };

  const handleViewTicket = (id: string) => {
    navigate(`/tickets/${id}`);
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      await ticketsAPI.delete(id);
      setTickets(tickets.filter((t) => t.id !== id));
      setSuccess("✅ تیکت با موفقیت حذف شد");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("خطا در حذف تیکت");
    }
  };

  // 🔥 تابع ارسال پیام در تیکت
  const handleSendTicketMessage = async (ticketId: string, message: string) => {
    try {
      await ticketsAPI.addMessage(ticketId, {
        content: message,
        senderType: "USER",
      });
      // به‌روزرسانی تیکت‌ها
      await fetchTickets();
    } catch (err) {
      console.error("❌ خطا در ارسال پیام:", err);
      throw err;
    }
  };

  // ============== Helper Functions ==============
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
      labels[status] || {
        label: status,
        icon: <AlertCircle size={14} />,
        color: "text-gray-400",
      }
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

  // ============== Loading & Error States ==============
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          <p className="text-blue-400/60 text-sm animate-pulse">بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <LiquidGlassCard
          className="p-8 text-center max-w-sm"
          borderRadius="24px"
        >
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-bold text-white mb-2">کاربری یافت نشد</h3>
          <p className="text-gray-400 mb-6">لطفاً دوباره وارد شوید</p>
          <GlassButton variant="primary" onClick={() => navigate("/login")}>
            ورود به حساب
          </GlassButton>
        </LiquidGlassCard>
      </div>
    );
  }

  // ============== Stats ==============
  const stats = {
    totalEnrollments: enrollments.length,
    confirmedEnrollments: enrollments.filter((e) => e.status === "CONFIRMED")
      .length,
    pendingEnrollments: enrollments.filter((e) => e.status === "PENDING")
      .length,
    attendedEnrollments: enrollments.filter((e) => e.status === "ATTENDED")
      .length,
    cartCount: cart.length,
    ticketCount: tickets.length,
    repliesCount: replies.length,
  };

  // ============== Render ==============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4 md:py-12">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader
          user={user}
          cartCount={stats.cartCount}
          onLogout={handleLogout}
          onCartClick={() => setActiveTab("cart")}
        />

        <ProfileStats
          stats={stats}
          onStatClick={(tab) => setActiveTab(tab as any)}
        />

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={stats.cartCount}
          ticketCount={stats.ticketCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProfileInfo
              user={user}
              formData={formData}
              editing={editing}
              saving={saving}
              error={error}
              success={success}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSave={handleSave}
              onChange={handleChange}
              onLogout={handleLogout}
            />
          </div>

          <div className="lg:col-span-2">
            {activeTab === "enrollments" && (
              <EnrollmentsTab
                enrollments={enrollments}
                navigate={navigate}
                formatDate={formatDate}
                formatPrice={formatPrice}
                getStatusLabel={getStatusLabel}
                getPaymentStatusLabel={getPaymentStatusLabel}
                handlePayment={handlePayment}
              />
            )}

            {activeTab === "cart" && (
              <CartTab
                cart={cart}
                processing={processing}
                processingId={processingId}
                totalCartPrice={cart.reduce(
                  (sum, item) => sum + item.event.price,
                  0,
                )}
                isCartFree={
                  cart.reduce((sum, item) => sum + item.event.price, 0) === 0 &&
                  cart.length > 0
                }
                handleCartPayment={handleCartPayment}
                handleRemoveFromCart={handleRemoveFromCart}
                handlePayAll={handlePayAll}
                formatPrice={formatPrice}
                navigate={navigate}
              />
            )}

            {activeTab === "tickets" && (
              <TicketsTab
                tickets={tickets}
                loading={ticketsLoading}
                navigate={navigate}
                onCreateTicket={handleCreateTicket}
                onViewTicket={handleViewTicket}
                onDeleteTicket={handleDeleteTicket}
                onSendMessage={handleSendTicketMessage} // 🔥 اضافه شد
              />
            )}

            {/* 🔥 تب پاسخ‌ها */}
            {activeTab === "replies" && (
              <RepliesTab
                replies={replies}
                loading={repliesLoading}
                formatDate={formatDate}
              />
            )}
          </div>
        </div>
      </div>

      {showPayment && selectedEnrollment && (
        <PaymentModal
          selectedEnrollment={selectedEnrollment}
          saving={saving}
          error={error}
          success={success}
          formatPrice={formatPrice}
          onClose={() => {
            setShowPayment(false);
            setSelectedEnrollment(null);
            setError("");
            setSuccess("");
          }}
          onConfirm={processPayment}
        />
      )}
    </div>
  );
}
