// src/components/admin/Tickets/TicketList.tsx
import { useEffect, useState } from "react";
import { Link,  } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { ticketsAPI } from "../../../lib/api/tickets";
import { LiquidGlassCard } from "../../ui/LiquidGlassCard";
import { GlassButton } from "../../ui/GlassButton";
import {
  Ticket,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Loader2,
  Users,
  Send,
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    phone: string;
  };
  messages?: {
    id: string;
    content: string;
    senderId: string;
    senderType: "USER" | "ADMIN";
    createdAt: string;
  }[];
}

export default function TicketList() {
  // const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  // 🔥 تشخیص نوع کاربر
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const adminStr = localStorage.getItem("admin");
  const employeeStr = localStorage.getItem("employee");

  const isAdmin =
    adminStr !== null || user?.role === "ADMIN" || user?.type === "admin";
  const isEmployee =
    employeeStr !== null ||
    user?.type === "employee" ||
    user?.role === "EMPLOYEE";

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let data;

      if (isEmployee && !isAdmin) {
        data = await ticketsAPI.getMyTickets();
      } else {
        data = await ticketsAPI.getAll();
      }

      setTickets(data || []);
    } catch (err) {
      setError("خطا در دریافت تیکت‌ها");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    try {
      const data = await ticketsAPI.getById(ticket.id);
      setSelectedTicket(data);
      setShowDetail(true);
    } catch (err) {
      alert("خطا در دریافت جزئیات تیکت");
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !reply.trim()) return;

    setSending(true);
    try {
      await ticketsAPI.addMessage(selectedTicket.id, {
        content: reply,
        senderType: "ADMIN",
      });

      const updated = await ticketsAPI.getById(selectedTicket.id);
      setSelectedTicket(updated);
      setReply("");

      // به‌روزرسانی لیست
      await fetchTickets();
    } catch (err) {
      alert("خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; icon: any; color: string }> =
      {
        OPEN: { label: "باز", icon: AlertCircle, color: "text-blue-400" },
        IN_PROGRESS: {
          label: "در حال بررسی",
          icon: Clock,
          color: "text-yellow-400",
        },
        RESOLVED: {
          label: "حل شده",
          icon: CheckCircle,
          color: "text-green-400",
        },
        CLOSED: { label: "بسته شده", icon: XCircle, color: "text-gray-400" },
      };
    return labels[status] || labels.OPEN;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      LOW: { label: "کم", color: "text-blue-400" },
      MEDIUM: { label: "متوسط", color: "text-yellow-400" },
      HIGH: { label: "بالا", color: "text-orange-400" },
      URGENT: { label: "فوری", color: "text-red-400" },
    };
    return labels[priority] || labels.MEDIUM;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "ALL") return true;
    return ticket.status === filter;
  });

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-6 h-6 text-blue-400" />
              مدیریت تیکت‌ها
            </h1>
            <p className="text-white/60 text-sm">
              {isEmployee && !isAdmin ? "تیکت‌های من" : "لیست تمام تیکت‌ها"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/tickets/create">
              <GlassButton
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                iconPosition="left"
              >
                تیکت جدید
              </GlassButton>
            </Link>
            {isAdmin && (
              <Link to="/admin/tickets/create-group">
                <GlassButton
                  variant="secondary"
                  size="md"
                  icon={<Users className="w-4 h-4" />}
                  iconPosition="left"
                >
                  تیکت گروهی
                </GlassButton>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                filter === f
                  ? f === "ALL"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                    : f === "OPEN"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                      : f === "IN_PROGRESS"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                        : f === "RESOLVED"
                          ? "bg-green-500/20 text-green-400 border border-green-400/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-400/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
              }`}
            >
              {f === "ALL" ? "همه" : getStatusLabel(f).label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const status = getStatusLabel(ticket.status);
            const priority = getPriorityLabel(ticket.priority);
            const StatusIcon = status.icon;

            return (
              <LiquidGlassCard
                key={ticket.id}
                className="p-4 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
                onClick={() => handleViewTicket(ticket)}
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {ticket.title}
                          <span className="text-xs text-white/40 font-normal">
                            #{ticket.id.slice(0, 8)}
                          </span>
                        </h3>
                        <p className="text-white/60 text-sm line-clamp-1 mt-1">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color} bg-white/5`}
                        >
                          {priority.label}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color} bg-white/5`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(ticket.createdAt)}
                      </span>
                      {ticket.user && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.user.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <GlassButton
                    variant="white"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                    iconPosition="left"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTicket(ticket);
                    }}
                  >
                    مشاهده
                  </GlassButton>
                </div>
              </LiquidGlassCard>
            );
          })}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-lg">هیچ تیکتی یافت نشد</p>
            <p className="text-sm text-white/30">
              {isEmployee && !isAdmin
                ? "هنوز تیکتی ثبت نکرده‌اید"
                : "هیچ تیکتی در سیستم وجود ندارد"}
            </p>
          </div>
        )}
      </div>

      {/* 🔥 مودال جزئیات تیکت برای ادمین */}
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
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-white/40">
                      #{selectedTicket.id.slice(0, 8)}
                    </span>
                    <span className="text-sm text-white/40">•</span>
                    <span className="text-sm text-white/40">
                      {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedTicket(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XCircle size={24} className="text-white/60" />
                </button>
              </div>

              <p className="text-gray-400 text-sm mb-4">
                {selectedTicket.description}
              </p>

              <div className="text-xs text-gray-500 flex gap-4 mb-4 pb-4 border-b border-white/10">
                <span
                  className={`px-2 py-1 rounded-full ${getStatusLabel(selectedTicket.status).color} bg-white/5`}
                >
                  {getStatusLabel(selectedTicket.status).label}
                </span>
                <span
                  className={`px-2 py-1 rounded-full ${getPriorityLabel(selectedTicket.priority).color} bg-white/5`}
                >
                  {getPriorityLabel(selectedTicket.priority).label}
                </span>
                {selectedTicket.user && (
                  <span className="flex items-center gap-1 text-white/40">
                    <User className="w-3 h-3" />
                    {selectedTicket.user.name}
                  </span>
                )}
              </div>

              {/* پیام‌ها */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 bg-white/5 rounded-xl p-4">
                {selectedTicket.messages?.length === 0 && (
                  <p className="text-center text-white/40 text-sm py-4">
                    هنوز پیامی ارسال نشده است
                  </p>
                )}
                {selectedTicket.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl ${
                      msg.senderType === "ADMIN"
                        ? "bg-blue-500/20 ml-auto max-w-[80%]"
                        : "bg-white/5 mr-auto max-w-[80%]"
                    }`}
                  >
                    <p className="text-white text-sm">{msg.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/30">
                        {msg.senderType === "ADMIN" ? "👤 ادمین" : "👤 کاربر"}
                      </span>
                      <span className="text-xs text-white/30">
                        {new Date(msg.createdAt).toLocaleString("fa-IR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ارسال پاسخ */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="پاسخ خود را بنویسید..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                />
                <GlassButton
                  variant="primary"
                  size="sm"
                  loading={sending}
                  icon={<Send className="w-4 h-4" />}
                  iconPosition="left"
                  onClick={handleSendReply}
                  disabled={!reply.trim()}
                >
                  ارسال
                </GlassButton>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
