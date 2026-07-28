// src/pages/admin/Users/UserList.tsx

import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { usersAPI } from "../../../lib/api/users";
import {
  Users,
  Search,
  Filter,
  Trash2,
  Loader2,
  Check,
  X,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { AdminListSkeleton } from "../../../components/skeletons/AdminListSkeleton";

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "USER" | "EMPLOYEE" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  _count?: {
    enrollments: number;
    tickets: number;
  };
}

const roleLabels: Record<
  string,
  { label: string; icon: React.ReactElement; color: string }
> = {
  USER: {
    label: "کاربر عادی",
    icon: <User size={14} />,
    color: "text-blue-400",
  },
  EMPLOYEE: {
    label: "کارمند",
    icon: <Briefcase size={14} />,
    color: "text-emerald-400",
  },
  ADMIN: {
    label: "مدیر ارشد",
    icon: <Shield size={14} />,
    color: "text-amber-400",
  },
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    console.log("🔄 useEffect اجرا شد - page:", page, "search:", search);
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      console.log("📥 شروع دریافت کاربران...");
      setLoading(true);

      const params = {
        page,
        limit: 10,
        search: search || undefined,
      };
      console.log("📤 پارامترهای درخواست:", params);

      const data = await usersAPI.getAll(params);
      console.log("📥 داده کامل از API:", data);
      console.log("📥 users در داده:", data.users);
      console.log("📥 نوع users:", typeof data.users);
      console.log("📥 آیا آرایه است؟", Array.isArray(data.users));

      if (data.users && Array.isArray(data.users)) {
        console.log("📥 تعداد کاربران:", data.users.length);
        setUsers(data.users);
      } else {
        console.warn("⚠️ users آرایه نیست یا undefined است:", data.users);
        setUsers([]);
      }

      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error("❌ خطا در دریافت کاربران:", err);
      setError("خطا در دریافت کاربران");
      setUsers([]);
    } finally {
      setLoading(false);
      console.log("✅ بارگذاری تمام شد");
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    setUpdating(true);
    try {
      await usersAPI.updateRole(selectedUser.id, newRole);
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole as any } : u,
        ),
      );
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert("خطا در تغییر نقش");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await usersAPI.update(id, { isActive: !currentStatus });
      setUsers(
        users.map((u) =>
          u.id === id ? { ...u, isActive: !currentStatus } : u,
        ),
      );
    } catch (err) {
      alert("خطا در تغییر وضعیت");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;
    try {
      await usersAPI.delete(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert("خطا در حذف کاربر");
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };
  if (loading) {
    return <AdminListSkeleton />;
  }
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  console.log("🎯 رندر نهایی - تعداد users:", users.length);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">👥 مدیریت کاربران</h1>
            <p className="text-white/60 text-sm">
              {users.length} کاربر در سیستم
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی کاربر..."
                className="w-48 px-4 py-2 pr-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Filter size={16} />}
              iconPosition="left"
              onClick={fetchUsers}
            >
              فیلتر
            </GlassButton>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>هیچ کاربری یافت نشد</p>
              <p className="text-sm text-gray-600 mt-2">
                برای تست یک کاربر ثبت‌نام کنید
              </p>
            </div>
          ) : (
            users.map((user) => {
              const roleInfo = roleLabels[user.role] || roleLabels.USER;

              return (
                <LiquidGlassCard
                  key={user.id}
                  className="p-4"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {user.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {user.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-gray-400">
                              <Phone size={14} />
                              {user.phone}
                            </span>
                            {user.email && (
                              <span className="flex items-center gap-1 text-gray-400">
                                <Mail size={14} />
                                {user.email}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-gray-500">
                              <Calendar size={14} />
                              {new Date(user.createdAt).toLocaleDateString(
                                "fa-IR",
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${roleInfo.color} bg-white/5`}
                          >
                            {roleInfo.icon}
                            {roleInfo.label}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.isActive
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {user.isActive ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" /> فعال
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <X className="w-3 h-3" /> غیرفعال
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                        <span>📚 {user._count?.enrollments || 0} ثبت‌نام</span>
                        <span>🎫 {user._count?.tickets || 0} تیکت</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                        title="تغییر نقش"
                      >
                        <Shield size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(user.id, user.isActive)
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
                            : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                        }`}
                      >
                        {user.isActive ? <X size={18} /> : <Check size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </LiquidGlassCard>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <span className="px-4 py-2 text-white/60">
              صفحه {page} از {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </div>

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <LiquidGlassCard
              className="p-8"
              borderRadius="32px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                تغییر نقش کاربر
              </h2>
              <p className="text-gray-400 text-center mb-6">
                تغییر نقش برای{" "}
                <span className="text-white font-bold">
                  {selectedUser.name}
                </span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    نقش جدید
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="USER">👤 کاربر عادی</option>
                    <option value="EMPLOYEE">💼 کارمند</option>
                    <option value="ADMIN">🛡️ مدیر ارشد</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <GlassButton
                    variant="white"
                    size="md"
                    className="flex-1"
                    onClick={() => {
                      setShowRoleModal(false);
                      setSelectedUser(null);
                    }}
                  >
                    انصراف
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    size="md"
                    className="flex-1"
                    loading={updating}
                    onClick={handleRoleChange}
                  >
                    تغییر نقش
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
