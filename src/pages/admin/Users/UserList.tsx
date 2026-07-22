import { useEffect, useState } from "react";
import { usersAPI } from "../../../lib/api/users";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { Search, User, Mail, Phone, Calendar, Trash2 } from "lucide-react";

interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  createdAt: string;
  _count?: {
    enrollments: number;
    messages: number;
  };
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersAPI.getAll({ limit: 100 }, token);
        setUsers(data.users || []);
      } catch (err) {
        setError("خطا در دریافت کاربران");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.includes(search) ||
      user.phone.includes(search) ||
      (user.email && user.email.includes(search)),
  );

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;

    try {
      await usersAPI.delete(id, token);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert("خطا در حذف کاربر");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">👤 مدیریت کاربران</h1>
          <p className="text-white/60 mt-1">لیست کاربران ثبت‌نام شده</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <LiquidGlassCard
          className="p-4"
          borderRadius="16px"
          blurIntensity="sm"
          glowIntensity="sm"
          shadowIntensity="md"
        >
          <div className="relative">
            <Search
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-10 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="جستجوی کاربران..."
            />
          </div>
        </LiquidGlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <LiquidGlassCard
              key={user.id}
              className="p-6"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              shadowIntensity="md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{user.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-white/40">
                        <Phone size={12} />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-white/40 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>
                      {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                  <div>ثبت‌نام: {user._count?.enrollments || 0}</div>
                  <div>پیام: {user._count?.messages || 0}</div>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <p className="text-2xl mb-2">👤</p>
            <p>کاربری یافت نشد</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
