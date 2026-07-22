import { useEffect, useState } from "react";
import { teamAPI } from "../../../lib/api/team";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { Plus, Edit, Trash2, Mail, Star } from "lucide-react";

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
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await teamAPI.getAll();
        setMembers(data || []);
      } catch (err) {
        setError("خطا در دریافت اعضای تیم");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این عضو مطمئن هستید؟")) return;

    try {
      await teamAPI.delete(id, token);
      setMembers(members.filter((m) => m.id !== id));
    } catch (err) {
      alert("خطا در حذف عضو");
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">👥 مدیریت تیم</h1>
            <p className="text-white/60 mt-1">اعضای تیم Supreme Tech</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2">
            <Plus size={18} />
            عضو جدید
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <LiquidGlassCard
              key={member.id}
              className="p-6 hover:scale-[1.02] transition-all duration-300"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              shadowIntensity="md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">
                          {member.name}
                        </h3>
                        {member.isFounder && (
                          <Star
                            size={16}
                            className="text-yellow-400 fill-yellow-400"
                          />
                        )}
                      </div>
                      <p className="text-white/60 text-sm">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-white/40 text-sm line-clamp-2">
                    {member.bio}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-white/40 hover:text-white transition"
                    >
                      <Mail size={16} />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-white transition"
                    >
                      {/* <Linkedin size={16} /> */}
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-white transition"
                    >
                      {/* <Github size={16} /> */}
                    </a>
                  )}
                  <span
                    className={`text-xs ${member.isActive ? "text-green-400" : "text-red-400"}`}
                  >
                    {member.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <p className="text-2xl mb-2">👥</p>
            <p>هنوز عضوی به تیم اضافه نشده است</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
