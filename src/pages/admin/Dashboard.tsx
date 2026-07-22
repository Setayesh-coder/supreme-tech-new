import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { statsAPI } from "../../lib/api/stats";
import {
  FileText,
  Calendar,
  Users,
  Eye,
  TrendingUp,
  ArrowUp,
} from "lucide-react";

interface Stats {
  totalPosts: number;
  totalEvents: number;
  totalEnrollments: number;
  todayViews: number;
  totalViews: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsAPI.getOverview(token);
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const statCards = [
    {
      label: "پست‌های بلاگ",
      value: stats?.totalPosts || 0,
      icon: <FileText size={24} />,
      color: "text-blue-400",
      change: "+12%",
    },
    {
      label: "رویدادها",
      value: stats?.totalEvents || 0,
      icon: <Calendar size={24} />,
      color: "text-green-400",
      change: "+5%",
    },
    {
      label: "ثبت‌نام‌ها",
      value: stats?.totalEnrollments || 0,
      icon: <Users size={24} />,
      color: "text-purple-400",
      change: "+18%",
    },
    {
      label: "بازدید امروز",
      value: stats?.todayViews || 0,
      icon: <Eye size={24} />,
      color: "text-orange-400",
      change: "+7%",
    },
    {
      label: "کل بازدیدها",
      value: stats?.totalViews || 0,
      icon: <TrendingUp size={24} />,
      color: "text-pink-400",
      change: "+27%",
    },
  ];

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
          <h1 className="text-3xl font-bold text-white">📊 داشبورد</h1>
          <p className="text-white/60 mt-1">خلاصه آماری سیستم</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <LiquidGlassCard
              key={stat.label}
              className="p-4"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              shadowIntensity="md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-green-400">
                      {stat.change}
                    </span>
                    <ArrowUp size={12} className="text-green-400" />
                  </div>
                </div>
                <div className={`${stat.color}`}>{stat.icon}</div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* 🔥 با div wrapper و onClick */}
          <div
            onClick={() => (window.location.href = "/admin/blog/create")}
            className="cursor-pointer"
          >
            <LiquidGlassCard
              className="p-4"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              shadowIntensity="md"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-white font-medium">نوشتن پست جدید</h3>
                  <p className="text-white/40 text-sm">
                    ایجاد یک پست بلاگ جدید
                  </p>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* 🔥 گزینه دوم: با LiquidGlassCard و onClick مستقیم */}
          <LiquidGlassCard
            className="p-4 cursor-pointer"
            borderRadius="16px"
            blurIntensity="sm"
            glowIntensity="sm"
            shadowIntensity="md"
            onClick={() => (window.location.href = "/admin/events/create")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-white font-medium">ایجاد رویداد جدید</h3>
                <p className="text-white/40 text-sm">برگزاری یک رویداد جدید</p>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* 🔥 Quick Action سوم - با hover scale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div
            onClick={() => (window.location.href = "/admin/users")}
            className="cursor-pointer"
          >
            <LiquidGlassCard
              className="p-4"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              shadowIntensity="md"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-white font-medium">مدیریت کاربران</h3>
                  <p className="text-white/40 text-sm">
                    مشاهده و مدیریت کاربران
                  </p>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          <div
            onClick={() => (window.location.href = "/admin/blog")}
            className="cursor-pointer"
          >
            <LiquidGlassCard
              className="p-4"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              shadowIntensity="md"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-white font-medium">مدیریت بلاگ</h3>
                  <p className="text-white/40 text-sm">ویرایش و حذف پست‌ها</p>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          <div
            onClick={() => (window.location.href = "/admin/events")}
            className="cursor-pointer"
          >
            <LiquidGlassCard
              className="p-4"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              shadowIntensity="md"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-white font-medium">مدیریت رویدادها</h3>
                  <p className="text-white/40 text-sm">ویرایش و حذف رویدادها</p>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
