// src/components/admin/Messages/MessageList.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "../AdminLayout";
import { LiquidGlassCard } from "../../ui/LiquidGlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { messagesAPI, type Message } from "../../../lib/api/messages";
import {
  Mail,
  Check,
  X,
  Trash2,
  Loader2,
  RefreshCw,
  Reply,
  User,
  Phone,
  Calendar,
  Send,
  AlertCircle,
} from "lucide-react";

// ✅ تایپ‌های محلی برای UI
interface MessageUI extends Message {
  // تبدیل is_read به boolean برای راحتی
  isRead: boolean;
  isReplied: boolean;
}

export default function MessageList() {
  const [messages, setMessages] = useState<MessageUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<MessageUI | null>(
    null,
  );
  const [showDetail, setShowDetail] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    fetchMessages();
  }, [page]);

  // ✅ دریافت پیام‌ها با صفحه‌بندی و فیلتر
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await messagesAPI.getAll({
        page,
        size: limit,
      });

      // تبدیل داده‌های API به فرمت UI
      const mappedMessages = response.items.map((msg) => ({
        ...msg,
        isRead: msg.is_read || false,
        isReplied: !!msg.reply, // اگر reply وجود داشته باشد، پاسخ داده شده است
      }));

      setMessages(mappedMessages);
      setTotal(response.total);
    } catch (err: any) {
      console.error("❌ خطا در دریافت پیام‌ها:", err);
      setError(err.response?.data?.detail || "خطا در دریافت پیام‌ها");
    } finally {
      setLoading(false);
    }
  };

  // ✅ علامت‌گذاری به عنوان خوانده شده
  const handleMarkAsRead = async (id: string) => {
    try {
      await messagesAPI.markAsRead(id);
      setMessages(
        messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (err) {
      alert("خطا در بروزرسانی وضعیت");
    }
  };

  // ✅ علامت‌گذاری به عنوان پاسخ داده شده
  const handleMarkAsReplied = async (id: string) => {
    try {
      await messagesAPI.markAsReplied(id);
      setMessages(
        messages.map((m) => (m.id === id ? { ...m, isReplied: true } : m)),
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isReplied: true });
      }
    } catch (err) {
      alert("خطا در بروزرسانی وضعیت");
    }
  };

  // ✅ حذف پیام
  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این پیام مطمئن هستید؟")) return;
    try {
      await messagesAPI.delete(id);
      setMessages(messages.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
        setShowDetail(false);
      }
    } catch (err) {
      alert("خطا در حذف پیام");
    }
  };

  // ✅ مشاهده جزئیات پیام
  const handleViewMessage = (message: MessageUI) => {
    setSelectedMessage(message);
    setShowDetail(true);
    if (!message.isRead) {
      handleMarkAsRead(message.id);
    }
  };

  // ✅ ارسال پاسخ
  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSendingReply(true);
    try {
      // ارسال پاسخ به API
      await messagesAPI.reply(selectedMessage.id, {
        reply: replyText,
      });

      // علامت پاسخ داده شده
      await handleMarkAsReplied(selectedMessage.id);

      // آپدیت UI
      setMessages(
        messages.map((m) =>
          m.id === selectedMessage.id ? { ...m, isReplied: true } : m,
        ),
      );
      setSelectedMessage({ ...selectedMessage, isReplied: true });
      setReplyText("");
      setShowReplyModal(false);
      alert("✅ پاسخ با موفقیت ارسال شد!");

      // رفرش لیست
      await fetchMessages();
    } catch (error) {
      console.error("❌ خطا:", error);
      alert("خطا در ارسال پاسخ");
    } finally {
      setSendingReply(false);
    }
  };

  // ✅ دریافت وضعیت نمایشی
  const getStatusInfo = (message: MessageUI) => {
    if (message.isReplied) {
      return {
        label: "پاسخ داده شده",
        color: "bg-green-500/20 text-green-400",
        icon: <Check className="w-3 h-3" />,
      };
    }
    if (message.isRead) {
      return {
        label: "خوانده شده",
        color: "bg-blue-500/20 text-blue-400",
        icon: <Check className="w-3 h-3" />,
      };
    }
    return {
      label: "در انتظار",
      color: "bg-yellow-500/20 text-yellow-400",
      icon: <AlertCircle className="w-3 h-3" />,
    };
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

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-400" />
              پیام‌ها
            </h1>
            <p className="text-white/60 text-sm">
              {unreadCount > 0
                ? `${unreadCount} پیام خوانده نشده`
                : "همه پیام‌ها خوانده شده"}
              <span className="mx-2">•</span>
              {total} پیام کل
            </p>
          </div>
          <GlassButton
            variant="primary"
            size="sm"
            icon={<RefreshCw size={16} />}
            iconPosition="left"
            onClick={fetchMessages}
          >
            بروزرسانی
          </GlassButton>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* لیست پیام‌ها */}
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>هیچ پیامی وجود ندارد</p>
              </div>
            ) : (
              messages.map((message) => {
                const status = getStatusInfo(message);
                return (
                  <LiquidGlassCard
                    key={message.id}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      !message.isRead ? "border-blue-500/30" : ""
                    }`}
                    borderRadius="12px"
                    blurIntensity="sm"
                    glowIntensity="sm"
                    onClick={() => handleViewMessage(message)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white truncate">
                            {message.project_type}
                          </h3>
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 animate-pulse" />
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${status.color} flex items-center gap-1 shrink-0`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {message.name} • {message.phone}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {message.project_description.substring(0, 80)}...
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 shrink-0">
                        {new Date(message.created_at).toLocaleDateString(
                          "fa-IR",
                        )}
                      </div>
                    </div>
                  </LiquidGlassCard>
                );
              })
            )}

            {/* صفحه‌بندی */}
            {total > limit && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  قبلی
                </button>
                <span className="px-3 py-1 text-white/60">
                  صفحه {page} از {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-3 py-1 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  بعدی
                </button>
              </div>
            )}
          </div>

          {/* جزئیات پیام */}
          <div>
            {showDetail && selectedMessage ? (
              <LiquidGlassCard
                className="p-6 sticky top-4"
                borderRadius="16px"
                blurIntensity="lg"
                glowIntensity="md"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {selectedMessage.project_type}
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetail(false);
                      setSelectedMessage(null);
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* اطلاعات فرستنده */}
                <div className="space-y-2 text-sm mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2 text-white/70">
                    <User size={16} />
                    <span>{selectedMessage.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Phone size={16} />
                    <span>{selectedMessage.phone}</span>
                  </div>
                  {selectedMessage.email && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Mail size={16} />
                      <span>{selectedMessage.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/50">
                    <Calendar size={16} />
                    <span>
                      {new Date(selectedMessage.created_at).toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  </div>
                </div>

                {/* متن پیام */}
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">
                  {selectedMessage.project_description}
                </div>

                {/* پاسخ موجود */}
                {selectedMessage.reply && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-400 text-sm font-medium mb-1">
                      پاسخ ارسال شده:
                    </p>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {selectedMessage.reply}
                    </p>
                    {selectedMessage.replied_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(selectedMessage.replied_at).toLocaleString(
                          "fa-IR",
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* وضعیت */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      selectedMessage.isRead
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {selectedMessage.isRead ? "خوانده شده" : "خوانده نشده"}
                  </span>
                  {selectedMessage.isReplied && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      پاسخ داده شده
                    </span>
                  )}
                </div>

                {/* دکمه‌ها */}
                <div className="flex flex-wrap gap-2">
                  {!selectedMessage.isRead && (
                    <GlassButton
                      variant="primary"
                      size="sm"
                      icon={<Check size={16} />}
                      iconPosition="left"
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                    >
                      خوانده شد
                    </GlassButton>
                  )}

                  <GlassButton
                    variant="success"
                    size="sm"
                    icon={<Reply size={16} />}
                    iconPosition="left"
                    onClick={() => setShowReplyModal(true)}
                    disabled={selectedMessage.isReplied}
                  >
                    {selectedMessage.isReplied ? "پاسخ داده شد" : "ارسال پاسخ"}
                  </GlassButton>

                  {!selectedMessage.isReplied && (
                    <GlassButton
                      variant="white"
                      size="sm"
                      icon={<Check size={16} />}
                      iconPosition="left"
                      onClick={() => handleMarkAsReplied(selectedMessage.id)}
                    >
                      پاسخ داده شد
                    </GlassButton>
                  )}

                  <GlassButton
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    iconPosition="left"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    حذف
                  </GlassButton>
                </div>
              </LiquidGlassCard>
            ) : (
              <LiquidGlassCard
                className="p-8 text-center"
                borderRadius="16px"
                blurIntensity="lg"
                glowIntensity="md"
              >
                <Mail className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-gray-400">
                  برای مشاهده جزئیات، روی یک پیام کلیک کنید
                </p>
              </LiquidGlassCard>
            )}
          </div>
        </div>
      </div>

      {/* مودال پاسخ */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <LiquidGlassCard
              className="p-6"
              borderRadius="20px"
              blurIntensity="xl"
              glowIntensity="lg"
            >
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                <Send className="w-6 h-6 inline-block ml-2" />
                ارسال پاسخ
              </h2>
              <p className="text-gray-400 text-sm text-center mb-4">
                پاسخ خود را برای "{selectedMessage.name}" ارسال کنید
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    متن پاسخ
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={5}
                    placeholder="متن پاسخ خود را وارد کنید..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <GlassButton
                    variant="white"
                    size="md"
                    className="flex-1"
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyText("");
                    }}
                  >
                    انصراف
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    size="md"
                    className="flex-1"
                    loading={sendingReply}
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                  >
                    ارسال پاسخ
                  </GlassButton>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
