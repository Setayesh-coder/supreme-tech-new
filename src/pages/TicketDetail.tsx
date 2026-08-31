// src/pages/TicketDetail.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ticketsAPI } from "../lib/api/tickets";
import type { Ticket, TicketMessage } from "../types/ticket";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";
import {
  ArrowLeft,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Calendar,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        if (!id) {
          setError("آدرس تیکت نامعتبر است");
          setLoading(false);
          return;
        }

        const fullTicket = await ticketsAPI.getById(id);
        console.log("📄 جزئیات تیکت:", fullTicket);
        setTicket(fullTicket);
      } catch (err: any) {
        console.error("❌ خطا:", err);
        setError(err.response?.data?.detail || "تیکت یافت نشد");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  // ✅ ارسال پیام با sendMessage
  const handleSendMessage = async () => {
    if (!reply.trim() || !ticket) return;

    setSending(true);
    try {
      // ✅ استفاده از sendMessage به جای addMessage
      await ticketsAPI.sendMessage(ticket.id, {
        message: reply.trim(),
      });

      // ✅ دریافت مجدد تیکت برای به‌روزرسانی
      const updated = await ticketsAPI.getById(ticket.id);
      setTicket(updated);
      setReply("");
      toast.success(" پیام با موفقیت ارسال شد");
    } catch (err: any) {
      console.error(" خطا:", err);
      toast.error(err.response?.data?.detail || "خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  // ✅ وضعیت‌های تیکت (هماهنگ با بک‌اند)
  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string; icon: any }> =
      {
        open: { label: "باز", color: "text-green-400", icon: AlertCircle },
        pending: { label: "در انتظار", color: "text-yellow-400", icon: Clock },
        answered: {
          label: "پاسخ داده شده",
          color: "text-blue-400",
          icon: CheckCircle,
        },
        in_progress: {
          label: "در حال بررسی",
          color: "text-orange-400",
          icon: Clock,
        },
        closed: { label: "بسته شده", color: "text-gray-400", icon: XCircle },
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

  // ✅ تشخیص پیام ادمین
  const isAdminMessage = (message: TicketMessage, ticket: Ticket) => {
    return message.user_id !== ticket.creator_id;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <LiquidGlassCard
          className="p-8 text-center max-w-md"
          borderRadius="24px"
        >
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {error || "تیکت یافت نشد"}
          </h3>
          <p className="text-gray-400 mb-6">تیکت مورد نظر شما وجود ندارد</p>
          <Link to="/profile">
            <GlassButton variant="primary">بازگشت به پروفایل</GlassButton>
          </Link>
        </LiquidGlassCard>
      </div>
    );
  }

  const status = getStatusLabel(ticket.status);
  const StatusIcon = status.icon;
  const priority = getPriorityLabel(ticket.priority);
  const userName = getUserName(ticket);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* هدر */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/profile">
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-white">جزئیات تیکت</h1>
          <span
            className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${status.color} bg-white/5`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs ${priority.color} bg-white/5`}
          >
            {priority.label}
          </span>
        </div>

        <LiquidGlassCard
          className="p-6"
          borderRadius="20px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {/* عنوان و اطلاعات */}
          <h2 className="text-xl font-bold text-white mb-2">{ticket.title}</h2>

          <div className="text-xs text-gray-500 flex flex-wrap gap-4 mb-4 pb-4 border-b border-white/10">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />#{ticket.id.slice(0, 8)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(ticket.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {userName}
            </span>
            {ticket.department && <span>🏢 {ticket.department}</span>}
          </div>

          {/* توضیحات تیکت */}
          {ticket.messages && (
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          )}

          {/* پیام‌ها */}
          <div className="space-y-3 max-h-96 overflow-y-auto mb-4 bg-white/5 rounded-xl p-4">
            {!ticket.messages || ticket.messages.length === 0 ? (
              <p className="text-center text-white/40 text-sm py-4">
                هنوز پیامی ارسال نشده است
              </p>
            ) : (
              ticket.messages.map((msg) => {
                // ✅ استفاده از user_id به جای sender_id
                const isAdmin = isAdminMessage(msg, ticket);
                const senderName =
                  msg.user?.name || (isAdmin ? "پشتیبانی" : "شما");

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

          {/* ارسال پیام - بررسی با lowercase */}
          {ticket.status?.toLowerCase() !== "closed" && (
            <div className="flex gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
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

          {ticket.status?.toLowerCase() === "closed" && (
            <p className="text-center text-gray-500 text-sm py-4">
              این تیکت بسته شده است و نمی‌توانید پیام جدیدی ارسال کنید.
            </p>
          )}
        </LiquidGlassCard>

        <div className="mt-4 text-center">
          <Link to="/profile">
            <button className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
              بازگشت به پروفایل
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
