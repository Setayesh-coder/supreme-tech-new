// src/pages/admin/Dashboard.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { statsAPI } from "../../lib/api/stats";
import { Users, Calendar, BookOpen, UserPlus, TrendingUp,  Award } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // ✅ بدون پارامتر
      const data = await statsAPI.getOverview();
      setStats(data);
    } catch (error) {
      console.error("❌ خطا در دریافت آمار:", error);
      setStats({
        users: 0,
        admins: 1,
        events: 0,
        courses: 0,
        enrollments: 0,
        courseEnrollments: 0,
        total: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "کاربران", value: stats?.users || 0, icon: <Users size={24} className="text-blue-400" />, color: "from-blue-500/20" },
    { title: "ادمین‌ها", value: stats?.admins || 0, icon: <UserPlus size={24} className="text-purple-400" />, color: "from-purple-500/20" },
    { title: "رویدادها", value: stats?.events || 0, icon: <Calendar size={24} className="text-green-400" />, color: "from-green-500/20" },
    { title: "دوره‌ها", value: stats?.courses || 0, icon: <BookOpen size={24} className="text-yellow-400" />, color: "from-yellow-500/20" },
    { title: "ثبت‌نام‌ها", value: stats?.enrollments || 0, icon: <TrendingUp size={24} className="text-cyan-400" />, color: "from-cyan-500/20" },
    { title: "ثبت‌نام دوره", value: stats?.courseEnrollments || 0, icon: <Award size={24} className="text-orange-400" />, color: "from-orange-500/20" }
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">داشبورد</h1>
            <p className="text-gray-400 text-sm mt-1">خلاصه وضعیت سامانه</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">در حال بارگذاری آمار...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {statCards.map((card, index) => (
                <LiquidGlassCard key={index} className={`p-6 bg-gradient-to-br ${card.color}`} borderRadius="16px" blurIntensity="sm" glowIntensity="sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{card.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      {card.icon}
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>

            <LiquidGlassCard className="p-6" borderRadius="16px" blurIntensity="lg" glowIntensity="md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {localStorage.getItem("admin") ? JSON.parse(localStorage.getItem("admin") || "{}").name?.charAt(0) || "A" : "A"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    خوش آمدید، {localStorage.getItem("admin") ? JSON.parse(localStorage.getItem("admin") || "{}").name || "ادمین" : "ادمین"}
                  </h2>
                  <p className="text-gray-400 text-sm">به پنل مدیریت Supreme Tech خوش آمدید.</p>
                </div>
              </div>
            </LiquidGlassCard>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
