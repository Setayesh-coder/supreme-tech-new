// src/pages/admin/Users/UserList.tsx

import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { usersAPI } from "../../../lib/api/users";
// import { authAPI } from "../../../lib/api";
import {
  Users,
  Search,
  Filter,
  Trash2,
  Check,
  X,
  Shield,
  UserIcon,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MapPin,
  Clock,
} from "lucide-react";
import { AdminListSkeleton } from "../../../components/skeletons/AdminListSkeleton";
import { toast } from "../../../hooks/use-toast";

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "USER" | "EMPLOYEE" | "ADMIN";
  isActive: boolean;
  province?: string;
  birthDate?: string;
  // birth_date?: string;
  gender?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    tickets: number;
  };
}

const roleLabels: Record<
  string,
  { label: string; icon: React.ReactElement; color: string; badge: string }
> = {
  USER: {
    label: "کاربر عادی",
    icon: <UserIcon size={14} />,
    color: "text-blue-400",
    badge: "bg-blue-500/20",
  },
  EMPLOYEE: {
    label: "کارمند",
    icon: <Briefcase size={14} />,
    color: "text-emerald-400",
    badge: "bg-emerald-500/20",
  },
  ADMIN: {
    label: "مدیر ارشد",
    icon: <Shield size={14} />,
    color: "text-amber-400",
    badge: "bg-amber-500/20",
  },
};

const genderLabels: Record<string, { label: string; icon: string }> = {
  MALE: { label: "مرد", icon: "👨" },
  FEMALE: { label: "زن", icon: "👩" },
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [fromData] = useState({ birthDate: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
        search: search || undefined,
      };
      // const response = await authAPI.getProfile(params);

      const response = await usersAPI.getAll(params);

      // ✅ ساختار پاسخ: { items: User[], total: number, page: number, limit: number, pages: number }
      if (response && response.items && Array.isArray(response.items)) {
        setUsers(response.items);
        const mappedUsers = response.items.map((user: any) => ({
          ...user,
          birthDate: user.birthDate || fromData.birthDate || "",
        }));
        setUsers(mappedUsers);

        setTotalPages(response.pages || 1);
        setTotalUsers(response.total || response.items.length);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err?.message || "خطا در دریافت کاربران");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    setUpdating(true);
    try {
      await usersAPI.updateRole(selectedUser.id, newRole as "USER" | "ADMIN");
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole as any } : u,
        ),
      );
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err?.message || "خطا در تغییر نقش");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await usersAPI.toggleActive(id);
      setUsers(
        users.map((u) =>
          u.id === id ? { ...u, isActive: !currentStatus } : u,
        ),
      );
    } catch (err) {
      toast.error("خطا در تغییر وضعیت");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;
    try {
      await usersAPI.delete(id);
      setUsers(users.filter((u) => u.id !== id));
      setTotalUsers(totalUsers - 1);
    } catch (err) {
      toast.error("خطا در حذف کاربر");
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMemberSince = (dateString: string) => {
    if (!dateString) return "-";
    const now = new Date();
    const created = new Date(dateString);
    const diff = now.getTime() - created.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 30) return `${days} روز`;
    if (days < 365) return `${Math.floor(days / 30)} ماه`;
    return `${Math.floor(days / 365)} سال`;
  };

  if (loading) {
    return <AdminListSkeleton />;
  }

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* هدر - ریسپانسیو */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white">
              👥 مدیریت کاربران
            </h1>
            <p className="text-white/60 text-sm">{totalUsers} کاربر در سیستم</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو..."
                className="w-full sm:w-48 lg:w-64 px-4 py-2 pr-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Filter size={16} />}
              iconPosition="left"
              onClick={fetchUsers}
              className="!px-3 !py-2 text-sm"
            >
              فیلتر
            </GlassButton>
          </div>
        </div>

        {/* خطا */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">
            ❌ {error}
          </div>
        )}

        {/* کارت‌های کاربران - موبایل */}
        <div className="lg:hidden space-y-3">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>هیچ کاربری یافت نشد</p>
            </div>
          ) : (
            users.map((user) => {
              const roleInfo = roleLabels[user.role] || roleLabels.USER;
              const genderInfo = user.gender ? genderLabels[user.gender] : null;

              return (
                <LiquidGlassCard
                  key={user.id}
                  className="p-4 hover:bg-white/5 transition-all duration-300"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                >
                  <div className="flex items-start gap-3">
                    {/* آواتار */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>

                    {/* اطلاعات */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-white truncate">
                            {user.name || "نامشخص"}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Phone size={12} />
                            <span>{user.phone || "-"}</span>
                          </div>
                          {user.email && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Mail size={12} />
                              <span className="truncate">{user.email}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${roleInfo.badge} ${roleInfo.color} flex items-center gap-1`}
                          >
                            {roleInfo.icon}
                            {roleInfo.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              user.isActive
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {user.isActive ? "فعال" : "غیرفعال"}
                          </span>
                        </div>
                      </div>

                      {/* اطلاعات تکمیلی */}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                        {user.province && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {user.province}
                          </span>
                        )}
                        {genderInfo && (
                          <span>
                            {genderInfo.icon} {genderInfo.label}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {getMemberSince(user.createdAt)}
                        </span>
                        {user.birthDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-500" />
                            {formatDate(user.birthDate)}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>

                      {/* دکمه‌های عملیات */}
                      <div className="flex gap-1 mt-3">
                        <button
                          onClick={() => openRoleModal(user)}
                          className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                          title="تغییر نقش"
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStatus(user.id, user.isActive)
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.isActive
                              ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
                              : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                          }`}
                        >
                          {user.isActive ? (
                            <X size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              );
            })
          )}
        </div>

        {/* جدول - دسکتاپ */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-gray-400 uppercase bg-white/5 rounded-xl">
              <tr>
                <th scope="col" className="px-4 py-3 rounded-tr-xl">
                  کاربر
                </th>
                <th scope="col" className="px-4 py-3">
                  شماره تماس
                </th>
                <th scope="col" className="px-4 py-3">
                  نقش
                </th>
                <th scope="col" className="px-4 py-3">
                  استان
                </th>
                <th scope="col" className="px-4 py-3">
                  تاریخ تولد
                </th>
                <th scope="col" className="px-4 py-3">
                  جنسیت
                </th>
                <th scope="col" className="px-4 py-3">
                  وضعیت
                </th>
                <th scope="col" className="px-4 py-3">
                  ثبت‌نام
                </th>
                <th scope="col" className="px-4 py-3 rounded-tl-xl">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>هیچ کاربری یافت نشد</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleInfo = roleLabels[user.role] || roleLabels.USER;
                  const genderInfo = user.gender
                    ? genderLabels[user.gender]
                    : null;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.name?.charAt(0)?.toUpperCase() || "U"
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {user.name || "نامشخص"}
                            </div>
                            {user.email && (
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Mail size={12} />
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-500" />
                          {user.phone || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${roleInfo.badge} ${roleInfo.color} flex items-center gap-1 w-fit`}
                        >
                          {roleInfo.icon}
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {user.province ? (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-500" />
                            {user.province}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {user.birthDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-500" />
                            {formatDate(user.birthDate)}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {genderInfo ? (
                          <span>
                            {genderInfo.icon} {genderInfo.label}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {user.isActive ? "فعال" : "غیرفعال"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {getMemberSince(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openRoleModal(user)}
                            className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                            title="تغییر نقش"
                          >
                            <Shield size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(user.id, user.isActive)
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.isActive
                                ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
                                : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                            }`}
                            title={user.isActive ? "غیرفعال کردن" : "فعال کردن"}
                          >
                            {user.isActive ? (
                              <X size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="حذف کاربر"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* صفحه‌بندی - ریسپانسیو */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <span className="text-sm text-gray-500 text-center sm:text-right">
              نمایش {(page - 1) * 10 + 1} تا {Math.min(page * 10, totalUsers)}{" "}
              از {totalUsers} کاربر
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <span className="px-3 py-2 text-white/60 text-sm">
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
          </div>
        )}
      </div>

      {/* Modal تغییر نقش */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <LiquidGlassCard
              className="p-6 lg:p-8"
              borderRadius="32px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-4 text-center">
                تغییر نقش کاربر
              </h2>
              <p className="text-gray-400 text-center mb-6 text-sm">
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  >
                    <option value="USER">👤 کاربر عادی</option>
                    {/* <option value="EMPLOYEE">💼 کارمند</option> */}
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
