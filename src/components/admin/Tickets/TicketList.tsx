// src/components/admin/Tickets/TicketList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ticketsAPI } from "../../../lib/api/tickets";
import type { Ticket, TicketMessage } from "../../../types/ticket";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import {
  Ticket as TicketIcon,
  Plus,
  Eye,
  Trash2,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  RefreshCw,
  Loader2,
  User,
  Calendar,
  Hash,
  Mail,
  // Phone,
} from "lucide-react";
import { AdminLayout } from "../AdminLayout";
import { toast } from "../../../hooks/use-toast";

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ticketsAPI.getAll();
      console.log("📋 تیکت‌ها دریافت شد:", data);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.detail || "خطا در دریافت تیکت‌ها");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
    toast.success("✅ تیکت‌ها به‌روزرسانی شدند");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این تیکت مطمئن هستید؟")) return;
    try {
      await ticketsAPI.delete(id);
      setTickets(tickets.filter((t) => t.id !== id));
      toast.success("✅ تیکت با موفقیت حذف شد");
    } catch (err: any) {
      console.error("❌ خطا:", err);
      toast.error(err.response?.data?.detail || "خطا در حذف تیکت");
    }
  };

  const handleViewTicket = async (id: string) => {
    try {
      const data = await ticketsAPI.getById(id);
      console.log("📄 جزئیات تیکت:", data);
      setSelectedTicket(data);
      setShowDetail(true);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      toast.error(err.response?.data?.detail || "خطا در دریافت اطلاعات تیکت");
    }
  };

  const handleSendMessage = async () => {
    if (!reply.trim() || !selectedTicket) return;

    setSending(true);
    try {
      await ticketsAPI.sendMessage(selectedTicket.id, {
        message: reply.trim(),
      });
      setReply("");

      const updated = await ticketsAPI.getById(selectedTicket.id);
      setSelectedTicket(updated);

      await fetchTickets();
      toast.success("✅ پیام با موفقیت ارسال شد");
    } catch (err: any) {
      console.error("❌ خطا:", err);
      toast.error(err.response?.data?.detail || "خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  // ✅ وضعیت‌های تیکت
  const getStatusLabel = (status: string) => {
    const labels: Record<
      string,
      { label: string; icon: React.ReactElement; color: string }
    > = {
      open: {
        label: "باز",
        icon: <AlertCircle size={14} />,
        color: "text-green-400",
      },
      pending: {
        label: "در انتظار",
        icon: <Clock size={14} />,
        color: "text-yellow-400",
      },
      answered: {
        label: "پاسخ داده شده",
        icon: <CheckCircle size={14} />,
        color: "text-blue-400",
      },
      in_progress: {
        label: "در حال بررسی",
        icon: <Clock size={14} />,
        color: "text-orange-400",
      },
      closed: {
        label: "بسته شده",
        icon: <XCircle size={14} />,
        color: "text-gray-400",
      },
    };
    return labels[status?.toLowerCase()] || labels.open;
  };

  // ✅ اولویت‌های تیکت
  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      LOW: { label: "کم", color: "text-blue-400" },
      MEDIUM: { label: "متوسط", color: "text-yellow-400" },
      HIGH: { label: "بالا", color: "text-orange-400" },
      URGENT: { label: "فوری", color: "text-red-400" },
      CRITICAL: { label: "بحرانی", color: "text-red-600" },
    };
    return labels[priority?.toUpperCase()] || labels.MEDIUM;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // ✅ دریافت نام کاربر
  const getUserName = (ticket: Ticket) => {
    if (ticket.creator?.name) return ticket.creator.name;
    if (ticket.creator?.email) return ticket.creator.email.split("@")[0];
    return `کاربر ${ticket.creator_id?.slice(0, 8) || "ناشناس"}`;
  };

  // ✅ دریافت ایمیل کاربر
  const getUserEmail = (ticket: Ticket) => {
    return ticket.creator?.email;
  };

  // ✅ تشخیص پیام ادمین
  const isAdminMessage = (message: TicketMessage, ticket: Ticket) => {
    return message.user_id !== ticket.creator_id;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-gray-400 mr-3">در حال بارگذاری تیکت‌ها...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* هدر */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">مدیریت تیکت‌ها</h1>
            <p className="text-gray-400 text-sm">
              {tickets.length} تیکت در سیستم
            </p>
          </div>
          <div className="flex gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
              icon={<RefreshCw className="w-4 h-4" />}
              iconPosition="left"
            >
              بروزرسانی
            </GlassButton>
            <Link to="/admin/tickets/create-group">
              <GlassButton
                variant="secondary"
                size="sm"
                icon={<Users className="w-4 h-4" />}
                iconPosition="left"
              >
                گروهی
              </GlassButton>
            </Link>
            <Link to="/admin/tickets/create">
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                iconPosition="left"
              >
                تیکت جدید
              </GlassButton>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 flex items-center gap-2">
            <X className="w-4 h-4" /> {error}
          </div>
        )}

        {tickets.length === 0 ? (
          <LiquidGlassCard
            className="p-12 text-center"
            borderRadius="16px"
            blurIntensity="sm"
          >
            <TicketIcon className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-bold text-white mb-2">
              هیچ تیکتی وجود ندارد
            </h3>
            <p className="text-gray-400">هنوز تیکتی در سیستم ثبت نشده است</p>
          </LiquidGlassCard>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const status = getStatusLabel(ticket.status);
              const priority = getPriorityLabel(ticket.priority);
              const userName = getUserName(ticket);
              const userEmail = getUserEmail(ticket);

              return (
                <LiquidGlassCard
                  key={ticket.id}
                  className="p-4 hover:bg-white/5 transition-all"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white truncate">
                          {ticket.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${priority.color} bg-white/5`}
                        >
                          {priority.label}
                        </span>
                        <span
                          className={`text-xs ${status.color} flex items-center gap-1`}
                        >
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {userName}
                          {userEmail && (
                            <span className="text-gray-600">({userEmail})</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(ticket.created_at)}
                        </span>
                        {ticket.department && (
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {ticket.department}
                          </span>
                        )}
                        {ticket.messages && ticket.messages.length > 0 && (
                          <span>💬 {ticket.messages.length} پیام</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        icon={<Eye className="w-3 h-3" />}
                        iconPosition="left"
                        onClick={() => handleViewTicket(ticket.id)}
                      >
                        مشاهده
                      </GlassButton>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </LiquidGlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal جزئیات تیکت */}
      {showDetail && selectedTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <LiquidGlassCard
              className="p-6"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedTicket.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm text-white/40">
                      #{selectedTicket.id.slice(0, 8)}
                    </span>
                    <span className="text-sm text-white/40">•</span>
                    <span className="text-sm text-white/40">
                      {formatDate(selectedTicket.created_at)}
                    </span>
                    <span className="text-sm text-white/40">•</span>
                    <span className="text-sm text-white/40 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {getUserName(selectedTicket)}
                    </span>
                    {selectedTicket.creator?.email && (
                      <span className="text-sm text-white/40 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedTicket.creator.email}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedTicket(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg"
                >
                  <X size={24} className="text-white/60" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusLabel(selectedTicket.status).color} bg-white/5`}
                >
                  {getStatusLabel(selectedTicket.status).label}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getPriorityLabel(selectedTicket.priority).color} bg-white/5`}
                >
                  {getPriorityLabel(selectedTicket.priority).label}
                </span>
                {selectedTicket.department && (
                  <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-gray-400">
                    {selectedTicket.department}
                  </span>
                )}
              </div>

              {/* پیام‌ها */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 bg-white/5 rounded-xl p-4">
                {!selectedTicket.messages ||
                selectedTicket.messages.length === 0 ? (
                  <p className="text-center text-white/40 text-sm py-4">
                    هنوز پیامی ارسال نشده است
                  </p>
                ) : (
                  selectedTicket.messages.map((msg) => {
                    const isAdmin = isAdminMessage(msg, selectedTicket);
                    const senderName =
                      msg.user?.name || (isAdmin ? "پشتیبانی" : "کاربر");

                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl ${
                          isAdmin
                            ? "bg-blue-500/20 ml-auto max-w-[80%]"
                            : "bg-white/5 mr-auto max-w-[80%]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-white/60">
                            {senderName}
                          </span>
                          <span className="text-xs text-white/30">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className="text-white text-sm whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ارسال پیام */}
              {selectedTicket.status?.toLowerCase() !== "closed" && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={sending}
                  />
                  <GlassButton
                    variant="primary"
                    size="sm"
                    loading={sending}
                    icon={<Send className="w-4 h-4" />}
                    iconPosition="left"
                    onClick={handleSendMessage}
                    disabled={!reply.trim() || sending}
                  >
                    ارسال
                  </GlassButton>
                </div>
              )}

              {selectedTicket.status?.toLowerCase() === "closed" && (
                <p className="text-center text-gray-400 text-sm">
                  این تیکت بسته شده است و نمی‌توانید پیام ارسال کنید
                </p>
              )}
            </LiquidGlassCard>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
