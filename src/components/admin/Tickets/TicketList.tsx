// src/pages/admin/Tickets/TicketList.tsx
import React from "react";
import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { ticketsAPI } from "../../../lib/api/tickets";
import {
  Ticket,
  Users,
  Plus,
  Loader2,
  Check,
  X,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  type: "SINGLE" | "GROUP";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  userId?: string;
  user?: { name: string; phone: string };
  groupId?: string;
  group?: { name: string };
  messages: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  }[];
  createdAt: string;
}

const statusLabels: Record<
  string,
  { label: string; color: string; icon: JSX.Element }
> = {
  OPEN: {
    label: "باز",
    color: "text-blue-400",
    icon: <AlertCircle size={14} />,
  },
  IN_PROGRESS: {
    label: "در حال بررسی",
    color: "text-amber-400",
    icon: <Clock size={14} />,
  },
  RESOLVED: {
    label: "حل شده",
    color: "text-green-400",
    icon: <Check size={14} />,
  },
  CLOSED: { label: "بسته", color: "text-gray-400", icon: <X size={14} /> },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  LOW: { label: "کم", color: "text-blue-400" },
  MEDIUM: { label: "متوسط", color: "text-amber-400" },
  HIGH: { label: "بالا", color: "text-orange-400" },
  URGENT: { label: "فوری", color: "text-red-400" },
};

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketsAPI.getAll();
      setTickets(data);
    } catch (err) {
      setError("خطا در دریافت تیکت‌ها");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (id: string) => {
    try {
      const data = await ticketsAPI.getById(id);
      setSelectedTicket(data);
      setShowDetail(true);
    } catch (err) {
      alert("خطا در دریافت جزئیات تیکت");
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyContent.trim()) return;

    try {
      await ticketsAPI.addMessage(selectedTicket.id, {
        content: replyContent,
        senderType: "ADMIN",
      });
      // به‌روزرسانی تیکت
      const updated = await ticketsAPI.getById(selectedTicket.id);
      setSelectedTicket(updated);
      setReplyContent("");
    } catch (err) {
      alert("خطا در ارسال پیام");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await ticketsAPI.updateStatus(id, status);
      fetchTickets();
    } catch (err) {
      alert("خطا در بروزرسانی وضعیت");
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">🎫 مدیریت تیکت‌ها</h1>
            <p className="text-white/60 text-sm">
              {tickets.filter((t) => t.status !== "CLOSED").length} تیکت باز
            </p>
          </div>
          <div className="flex gap-2">
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              iconPosition="left"
              onClick={() => (window.location.href = "/admin/tickets/create")}
            >
              تیکت جدید
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              icon={<Users size={16} />}
              iconPosition="left"
              onClick={() =>
                (window.location.href = "/admin/tickets/create-group")
              }
            >
              تیکت گروهی
            </GlassButton>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {tickets.map((ticket) => {
            const status = statusLabels[ticket.status] || statusLabels.OPEN;
            const priority =
              priorityLabels[ticket.priority] || priorityLabels.MEDIUM;

            return (
              <LiquidGlassCard
                key={ticket.id}
                className="p-4 cursor-pointer hover:scale-[1.01] transition-all duration-300"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
                onClick={() => handleViewTicket(ticket.id)}
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {ticket.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${priority.color} bg-white/5`}
                        >
                          {priority.label}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${status.color} bg-white/5`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-gray-400">
                          {ticket.type === "GROUP" ? "👥 گروهی" : "👤 تکی"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>
                        {ticket.type === "GROUP"
                          ? `گروه: ${ticket.group?.name || "نامشخص"}`
                          : `کاربر: ${ticket.user?.name || "نامشخص"}`}
                      </span>
                      <span>📩 {ticket.messages?.length || 0} پیام</span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            );
          })}
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>هیچ تیکتی وجود ندارد</p>
          </div>
        )}
      </div>

      {/* مودال جزئیات تیکت */}
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
                  <p className="text-sm text-gray-400">
                    {selectedTicket.type === "GROUP" ? "👥 گروهی" : "👤 تکی"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedTicket(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white/60" />
                </button>
              </div>

              {/* پیام‌ها */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {selectedTicket.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl ${
                      msg.senderId === "ADMIN"
                        ? "bg-blue-500/20 ml-auto max-w-[80%]"
                        : "bg-white/5 mr-auto max-w-[80%]"
                    }`}
                  >
                    <p className="text-white text-sm">{msg.content}</p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {new Date(msg.createdAt).toLocaleString("fa-IR")}
                    </span>
                  </div>
                ))}
              </div>

              {/* پاسخ */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="پاسخ خود را بنویسید..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleReply()}
                />
                <GlassButton
                  variant="primary"
                  size="sm"
                  icon={<Send size={16} />}
                  iconPosition="left"
                  onClick={handleReply}
                >
                  ارسال
                </GlassButton>
              </div>

              {/* عملیات */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => {
                    handleUpdateStatus(selectedTicket.id, e.target.value);
                    setSelectedTicket({
                      ...selectedTicket,
                      status: e.target.value as any,
                    });
                  }}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="OPEN">باز</option>
                  <option value="IN_PROGRESS">در حال بررسی</option>
                  <option value="RESOLVED">حل شده</option>
                  <option value="CLOSED">بسته</option>
                </select>
                <GlassButton
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm("آیا از حذف این تیکت مطمئن هستید؟")) {
                      // حذف تیکت
                    }
                  }}
                >
                  حذف
                </GlassButton>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
