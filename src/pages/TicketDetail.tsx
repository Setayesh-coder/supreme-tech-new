// src/pages/TicketDetail.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ticketsAPI } from "../lib/api/tickets";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";
import {
  ArrowLeft,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    content: string;
    senderId: string;
    senderType: "USER" | "ADMIN";
    createdAt: string;
  }[];
  user?: { name: string; phone: string };
}

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
        // 🔥 بررسی وجود id
        if (!id) {
          setError("آدرس تیکت نامعتبر است");
          setLoading(false);
          return;
        }

        // 🔥 دریافت همه تیکت‌های کاربر
        const allTickets = await ticketsAPI.getMyTickets();
        // 🔥 پیدا کردن تیکت مورد نظر
        const found = allTickets.find((t: any) => t.id === id);

        if (!found) {
          setError("تیکت یافت نشد");
          setLoading(false);
          return;
        }

        // 🔥 دریافت جزئیات کامل تیکت (با messages)
        const fullTicket = await ticketsAPI.getById(id);
        setTicket(fullTicket);
      } catch (err) {
        console.error("❌ خطا:", err);
        setError("تیکت یافت نشد");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handleSendMessage = async () => {
    if (!reply.trim() || !ticket) return;

    setSending(true);
    try {
      await ticketsAPI.addMessage(ticket.id, {
        content: reply,
        senderType: "USER",
      });

      // به‌روزرسانی تیکت
      const updated = await ticketsAPI.getById(ticket.id);
      setTicket(updated);
      setReply("");
    } catch (err) {
      alert("خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string; icon: any }> =
      {
        OPEN: { label: "باز", color: "text-blue-400", icon: AlertCircle },
        IN_PROGRESS: {
          label: "در حال بررسی",
          color: "text-yellow-400",
          icon: Clock,
        },
        RESOLVED: {
          label: "حل شده",
          color: "text-green-400",
          icon: CheckCircle,
        },
        CLOSED: { label: "بسته شده", color: "text-gray-400", icon: XCircle },
      };
    return labels[status] || labels.OPEN;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
        </div>

        <LiquidGlassCard
          className="p-6"
          borderRadius="20px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          <h2 className="text-xl font-bold text-white mb-2">{ticket.title}</h2>
          <p className="text-gray-400 text-sm mb-4">{ticket.description}</p>

          <div className="text-xs text-gray-500 flex gap-4 mb-6 pb-4 border-b border-white/10">
            <span>🆔 #{ticket.id.slice(0, 8)}</span>
            <span>
              📅 {new Date(ticket.createdAt).toLocaleDateString("fa-IR")}
            </span>
            <span>
              🕐 {new Date(ticket.createdAt).toLocaleTimeString("fa-IR")}
            </span>
          </div>

          {/* پیام‌ها */}
          <div className="space-y-3 max-h-96 overflow-y-auto mb-4 bg-white/5 rounded-xl p-4">
            {ticket.messages?.length === 0 && (
              <p className="text-center text-white/40 text-sm py-4">
                هنوز پیامی ارسال نشده است
              </p>
            )}
            {ticket.messages?.map((msg) => (
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
                    {msg.senderType === "ADMIN" ? "👤 پشتیبانی" : "👤 شما"}
                  </span>
                  <span className="text-xs text-white/30">
                    {new Date(msg.createdAt).toLocaleString("fa-IR")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ارسال پیام */}
          {ticket.status !== "CLOSED" && (
            <div className="flex gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <GlassButton
                variant="primary"
                size="sm"
                loading={sending}
                icon={<Send className="w-4 h-4" />}
                iconPosition="left"
                onClick={handleSendMessage}
                disabled={!reply.trim()}
              >
                ارسال
              </GlassButton>
            </div>
          )}

          {ticket.status === "CLOSED" && (
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
