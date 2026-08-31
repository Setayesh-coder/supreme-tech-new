// src/pages/admin/Team/TeamList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { teamAPI } from "../../../lib/api/team";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { showConfirmToast } from "../../../components/ui/confirm-toast";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  order: number;
  isActive: boolean;
  isFounder: boolean;
}

export default function TeamList() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.getAll();
      setMembers(data.items || data.data || data || []);
    } catch (err) {
      setError("خطا در دریافت اعضای تیم");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirmToast({
      title: "آیا از حذف این عضو مطمئن هستید؟",
      description: "این عضو از تیم حذف خواهد شد.",
      variant: "danger",
      confirmText: "بله، حذف شود",
      cancelText: "انصراف",
      onConfirm: async () => {
        try {
          await teamAPI.delete(id);
          setMembers(members.filter((m) => m.id !== id));
          toast.success("✅ عضو با موفقیت حذف شد");
        } catch (err) {
          toast.error("❌ خطا در حذف عضو");
        }
      },
    });
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-gray-400 mr-3">در حال بارگذاری...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              مدیریت تیم
            </h1>
            <p className="text-gray-400 text-sm mt-1">مدیریت اعضای تیم</p>
          </div>
          <Link to="/admin/team/create">
            <GlassButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              عضو جدید
            </GlassButton>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجوی اعضا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
            ❌ {error}
          </div>
        )}

        {filteredMembers.length === 0 ? (
          <LiquidGlassCard
            className="p-12 text-center"
            borderRadius="16px"
            blurIntensity="sm"
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">عضوی یافت نشد</h3>
            <p className="text-gray-400">هنوز عضوی به تیم اضافه نشده است</p>
          </LiquidGlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <LiquidGlassCard
                key={member.id}
                className="p-4"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                {member.avatar && (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                  />
                )}
                <h3 className="text-lg font-bold text-white text-center">
                  {member.name}
                </h3>
                <p className="text-gray-400 text-sm text-center">
                  {member.role}
                </p>
                {member.isFounder && (
                  <p className="text-yellow-400 text-xs text-center">
                    ⭐ بنیان‌گذار
                  </p>
                )}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <Link to={`/admin/team/edit/${member.id}`} className="flex-1">
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      fullWidth
                      icon={<Edit className="w-4 h-4" />}
                      iconPosition="left"
                    >
                      ویرایش
                    </GlassButton>
                  </Link>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
