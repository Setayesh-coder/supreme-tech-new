// src/components/admin/Tickets/TicketGroupCreate.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ticketsAPI } from "../../../lib/api/tickets";
import { usersAPI } from "../../../lib/api/users";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import {
  ArrowLeft,
  Save,
  User,
  AlertCircle,
  Users,
  CheckCircle,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export default function TicketGroupCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    message: "", // ✅ تغییر از message به description
    department: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ فیلتر کردن کاربران بر اساس جستجو
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await usersAPI.getAll();
      const userList = data.items || data || [];
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (err: any) {
      console.error("❌ خطا در دریافت کاربران:", err);
      toast.error(err.response?.data?.detail || "خطا در دریافت کاربران");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // ✅ انتخاب/لغو انتخاب همه کاربران
  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  // ✅ حذف یک کاربر از لیست انتخاب شده
  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ اعتبارسنجی
    if (!formData.title.trim()) {
      toast.error(" عنوان تیکت الزامی است");
      return;
    }
    if (!formData.message.trim()) {
      toast.error(" متن پیام الزامی است");
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error(" حداقل یک کاربر را انتخاب کنید");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await ticketsAPI.createGroup({
        title: formData.title,
        message: formData.message, // ✅ ارسال description
        department: formData.department || undefined,
        priority: formData.priority,
        user_ids: selectedUsers, // ✅ تغییر از members به user_ids
      });

      setSuccess(" تیکت گروهی با موفقیت ایجاد شد!");
      toast.success(" تیکت گروهی با موفقیت ایجاد شد");

      setTimeout(() => {
        navigate("/admin/tickets");
      }, 1500);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      const errorMsg = err.response?.data?.detail || "خطا در ایجاد تیکت گروهی";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ نمایش تعداد کاربران انتخاب شده
  const selectedCount = selectedUsers.length;
  const totalCount = filteredUsers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* هدر */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/tickets")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              ایجاد تیکت گروهی
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              برای چند کاربر به صورت همزمان تیکت ایجاد کنید
            </p>
          </div>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="20px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {/* خطا */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* موفقیت */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* عنوان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                عنوان تیکت <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="مثال: اطلاعیه بروزرسانی سیستم"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* دپارتمان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                دپارتمان
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                disabled={loading}
              >
                <option value="">انتخاب دپارتمان...</option>
                <option value="technical">🛠️ فنی</option>
                <option value="support">💬 پشتیبانی</option>
                <option value="sales">💰 فروش</option>
                <option value="general">📋 عمومی</option>
              </select>
            </div>

            {/* پیام */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                متن پیام <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="توضیحات کامل را وارد کنید..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                required
                disabled={loading}
              />
            </div>

            {/* اولویت */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                اولویت
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                disabled={loading}
              >
                <option value="LOW">🟢 کم</option>
                <option value="MEDIUM">🟡 متوسط</option>
                <option value="HIGH">🟠 بالا</option>
                <option value="URGENT">🔴 فوری</option>
                <option value="CRITICAL">🔥 بحرانی</option>
              </select>
            </div>

            {/* انتخاب کاربران */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-white/80">
                  انتخاب کاربران <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-gray-400">
                  {selectedCount} از {totalCount} انتخاب شده
                </span>
              </div>

              {/* جستجو */}
              <div className="relative mb-3">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجوی کاربران..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-all text-sm"
                  disabled={loadingUsers || loading}
                />
              </div>

              {/* لیست کاربران */}
              <div className="space-y-1 max-h-48 overflow-y-auto bg-white/5 rounded-xl p-2 custom-scrollbar">
                {loadingUsers ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    <span className="text-gray-400 text-sm mr-2">
                      در حال بارگذاری...
                    </span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    {searchTerm
                      ? "کاربری یافت نشد"
                      : "هیچ کاربری در سیستم وجود ندارد"}
                  </p>
                ) : (
                  <>
                    {/* گزینه انتخاب همه */}
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5">
                      <input
                        type="checkbox"
                        checked={
                          selectedCount === filteredUsers.length &&
                          filteredUsers.length > 0
                        }
                        onChange={toggleAllUsers}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <span className="text-white text-sm font-medium">
                        انتخاب همه
                      </span>
                      <span className="text-gray-400 text-xs">
                        ({filteredUsers.length} کاربر)
                      </span>
                    </label>

                    {filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                          disabled={loading}
                        />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <span className="text-white text-sm">
                            {user.name}
                          </span>
                          <span className="text-gray-400 text-xs block">
                            {user.phone}
                            {user.email && ` | ${user.email}`}
                          </span>
                        </div>
                      </label>
                    ))}
                  </>
                )}
              </div>

              {/* نمایش کاربران انتخاب شده */}
              {selectedCount > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedUsers.map((id) => {
                    const user = users.find((u) => u.id === id);
                    if (!user) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs"
                      >
                        {user.name}
                        <button
                          type="button"
                          onClick={() => removeSelectedUser(id)}
                          className="hover:text-red-400 transition-colors"
                          disabled={loading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <GlassButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate("/admin/tickets")}
                className="flex-1"
                disabled={loading}
              >
                انصراف
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                icon={<Save className="w-5 h-5" />}
                iconPosition="left"
                disabled={loading || selectedCount === 0}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {loading ? "در حال ایجاد..." : "ایجاد تیکت گروهی"}
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>

      {/* استایل اسکرولبار */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
