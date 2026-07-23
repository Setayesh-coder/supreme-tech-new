// src/pages/admin/Messages/

import { useState, useEffect } from "react";
import { AdminLayout } from "../AdminLayout";
import { LiquidGlassCard } from "../../ui/LiquidGlassCard";
import { GlassButton } from "../../ui/GlassButton";
import { messagesAPI } from "../../../lib/api/messages";
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
} from "lucide-react";

interface Message {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  createdAt: string;
}

export default function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messagesAPI.getAll();
      setMessages(data);
    } catch (err) {
      setError("خطا در دریافت پیام‌ها");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowDetail(true);
    if (!message.isRead) {
      handleMarkAsRead(message.id);
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

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">📬 پیام‌ها</h1>
            <p className="text-white/60 text-sm">
              {unreadCount > 0
                ? `${unreadCount} پیام خوانده نشده`
                : "همه پیام‌ها خوانده شده"}
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
            {error}
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
              messages.map((message) => (
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
                          {message.subject}
                        </h3>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                        )}
                        {message.isReplied && (
                          <span className="text-xs text-green-400 shrink-0">
                            ✅ پاسخ داده شده
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {message.name} • {message.phone}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {message.message.substring(0, 80)}...
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 shrink-0">
                      {new Date(message.createdAt).toLocaleDateString("fa-IR")}
                    </div>
                  </div>
                </LiquidGlassCard>
              ))
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
                    {selectedMessage.subject}
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
                      {new Date(selectedMessage.createdAt).toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  </div>
                </div>

                {/* متن پیام */}
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">
                  {selectedMessage.message}
                </div>

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
                  {!selectedMessage.isReplied && (
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      icon={<Reply size={16} />}
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
    </AdminLayout>
  );
}
