import { useState } from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import {
  Ticket,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Trash2,
  Send,
  X,
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  category: string;
  messages?: {
    id: string;
    content: string;
    senderId: string;
    senderType: "USER" | "ADMIN";
    createdAt: string;
  }[];
}

interface TicketsTabProps {
  tickets: Ticket[];
  loading: boolean;
  navigate: (path: string) => void;
  onCreateTicket: () => void;
  onViewTicket: (id: string) => void;
  onDeleteTicket: (id: string) => void;
  onSendMessage?: (ticketId: string, message: string) => Promise<void>;
}

export function TicketsTab({
  tickets,
  loading,
  onCreateTicket,
  // onViewTicket,
  onDeleteTicket,
  onSendMessage,
}: TicketsTabProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const getStatusLabel = (status: string) => {
    const labels: Record<
      string,
      { label: string; icon: JSX.Element; color: string }
    > = {
      OPEN: {
        label: "باز",
        icon: <AlertCircle size={14} />,
        color: "text-blue-400",
      },
      IN_PROGRESS: {
        label: "در حال بررسی",
        icon: <Clock size={14} />,
        color: "text-yellow-400",
      },
      RESOLVED: {
        label: "حل شده",
        icon: <CheckCircle size={14} />,
        color: "text-green-400",
      },
      CLOSED: {
        label: "بسته شده",
        icon: <XCircle size={14} />,
        color: "text-gray-400",
      },
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
    return labels[priority] || labels.LOW;
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

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetail(true);
  };

  const handleSendMessage = async () => {
    if (!reply.trim() || !selectedTicket || !onSendMessage) return;

    setSending(true);
    try {
      await onSendMessage(selectedTicket.id, reply);
      setReply("");
      // به‌روزرسانی تیکت با پیام جدید
      const updatedTicket = {
        ...selectedTicket,
        messages: [
          ...(selectedTicket.messages || []),
          {
            id: Date.now().toString(),
            content: reply,
            senderId: "user",
            senderType: "USER" as const,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      setSelectedTicket(updatedTicket);
    } catch (err) {
      alert("خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <LiquidGlassCard
        className="p-8"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </LiquidGlassCard>
    );
  }

  return (
    <>
      <LiquidGlassCard
        className="p-6"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-red-400" />
            تیکت‌های پشتیبانی
            <span className="text-sm text-gray-400 font-normal mr-2">
              ({tickets.length})
            </span>
          </h2>
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            onClick={onCreateTicket}
          >
            تیکت جدید
          </GlassButton>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">هنوز تیکتی ثبت نکرده‌اید</p>
            <p className="text-gray-500 text-sm">
              برای دریافت پشتیبانی، یک تیکت جدید ثبت کنید
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const status = getStatusLabel(ticket.status);
              const priority = getPriorityLabel(ticket.priority);

              return (
                <LiquidGlassCard
                  key={ticket.id}
                  className="p-4 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                  borderRadius="14px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-white truncate">
                          {ticket.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium ${priority.color} px-2 py-1 rounded-full bg-white/5`}
                          >
                            {priority.label}
                          </span>
                          <span
                            className={`text-xs font-medium ${status.color} flex items-center gap-1`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm line-clamp-1 mt-1">
                        {ticket.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ticket.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <GlassButton
                        variant="white"
                        size="sm"
                        icon={<Eye className="w-3 h-3" />}
                        iconPosition="left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTicket(ticket);
                        }}
                      >
                        مشاهده
                      </GlassButton>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("آیا از حذف این تیکت مطمئن هستید؟")) {
                            onDeleteTicket(ticket.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all duration-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </LiquidGlassCard>
              );
            })}
          </div>
        )}

        {tickets.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
            <span>
              آخرین بروزرسانی:{" "}
              {formatDate(tickets[0]?.updatedAt || new Date().toISOString())}
            </span>
            <span>کل تیکت‌ها: {tickets.length}</span>
          </div>
        )}
      </LiquidGlassCard>

      {/* 🔥 مودال جزئیات تیکت */}
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
                  <X size={24} className="text-white/60" />
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
              {selectedTicket.status !== "CLOSED" && (
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

              {selectedTicket.status === "CLOSED" && (
                <p className="text-center text-gray-500 text-sm py-4">
                  این تیکت بسته شده است و نمی‌توانید پیام جدیدی ارسال کنید.
                </p>
              )}
            </LiquidGlassCard>
          </div>
        </div>
      )}
    </>
  );
}
