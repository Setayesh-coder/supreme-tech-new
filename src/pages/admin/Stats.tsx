// src/pages/admin/Stats.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { statsAPI } from "../../lib/api/stats";
import {
  RefreshCw,
  BarChart3,
  Users,
  Eye,
  FileText,
  CalendarDays,
  MessageSquare,
} from "lucide-react";

interface PageStat {
  path: string;
  views: number;
  percentage: number;
}

interface DailyStat {
  date: string;
  views: number;
  unique_visitors: number;
}

export default function Stats() {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  const [blogStats, setBlogStats] = useState<any>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState<
    "overview" | "pages" | "blog" | "events"
  >("overview");

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [daily, pages] = await Promise.all([
        statsAPI.getDaily(days),
        statsAPI.getPages(10),
      ]);
      setDailyStats(daily || []);
      setPageStats(pages || []);

      // آمار بلاگ و رویدادها
      try {
        const blog = await statsAPI.getBlogStats();
        setBlogStats(blog);
      } catch (e) {
        console.log("آمار بلاگ در دسترس نیست");
      }

      try {
        const events = await statsAPI.getEventStats();
        setEventStats(events);
      } catch (e) {
        console.log("آمار رویدادها در دسترس نیست");
      }
    } catch (error) {
      console.error("❌ خطا:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalViews = dailyStats.reduce((sum, d) => sum + d.views, 0);
  const totalVisitors = dailyStats.reduce(
    (sum, d) => sum + d.unique_visitors,
    0,
  );

  const tabs = [
    { id: "overview", label: "نمای کلی", icon: <BarChart3 size={18} /> },
    { id: "pages", label: "صفحات", icon: <FileText size={18} /> },
    { id: "blog", label: "وبلاگ", icon: <MessageSquare size={18} /> },
    { id: "events", label: "رویدادها", icon: <CalendarDays size={18} /> },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* هدر */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              📊 آمار و آنالیتیکس
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              مشاهده آمار بازدیدها، بلاگ و رویدادها
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="7">۷ روز اخیر</option>
              <option value="14">۱۴ روز اخیر</option>
              <option value="30">۳۰ روز اخیر</option>
              <option value="90">۹۰ روز اخیر</option>
            </select>
            <GlassButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              iconPosition="left"
              onClick={fetchStats}
            >
              بروزرسانی
            </GlassButton>
          </div>
        </div>

        {/* تب‌ها */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white/5 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-500/30 text-blue-400 border border-blue-400/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* نمای کلی */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <LiquidGlassCard
                    className="p-4 text-center"
                    borderRadius="16px"
                    blurIntensity="sm"
                  >
                    <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {totalViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">کل بازدید</p>
                  </LiquidGlassCard>
                  <LiquidGlassCard
                    className="p-4 text-center"
                    borderRadius="16px"
                    blurIntensity="sm"
                  >
                    <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {totalVisitors.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">بازدیدکننده یکتا</p>
                  </LiquidGlassCard>
                  <LiquidGlassCard
                    className="p-4 text-center"
                    borderRadius="16px"
                    blurIntensity="sm"
                  >
                    <FileText className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {blogStats?.total_posts || 0}
                    </p>
                    <p className="text-xs text-gray-500">پست‌های بلاگ</p>
                  </LiquidGlassCard>
                  <LiquidGlassCard
                    className="p-4 text-center"
                    borderRadius="16px"
                    blurIntensity="sm"
                  >
                    <CalendarDays className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {eventStats?.total_events || 0}
                    </p>
                    <p className="text-xs text-gray-500">رویدادها</p>
                  </LiquidGlassCard>
                </div>

                {/* نمودار ساده روزانه */}
                <LiquidGlassCard
                  className="p-6"
                  borderRadius="20px"
                  blurIntensity="lg"
                >
                  <h3 className="text-white font-bold mb-4">
                    📈 بازدید روزانه
                  </h3>
                  <div className="flex items-end gap-1 h-32">
                    {dailyStats.map((day, index) => {
                      const maxViews = Math.max(
                        ...dailyStats.map((d) => d.views),
                        1,
                      );
                      const height = (day.views / maxViews) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-full bg-blue-500/50 rounded-t hover:bg-blue-400 transition-all duration-300"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          />
                          <span className="text-[10px] text-gray-500 rotate-45">
                            {new Date(day.date).toLocaleDateString("fa-IR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </LiquidGlassCard>
              </div>
            )}

            {/* صفحات */}
            {activeTab === "pages" && (
              <LiquidGlassCard
                className="p-6"
                borderRadius="20px"
                blurIntensity="lg"
              >
                <h3 className="text-white font-bold mb-4">
                  📄 پربازدیدترین صفحات
                </h3>
                <div className="space-y-3">
                  {pageStats.length > 0 ? (
                    pageStats.map((page, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-6">
                            #{index + 1}
                          </span>
                          <span className="text-gray-300 text-sm truncate max-w-[200px]">
                            {page.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white font-bold text-sm">
                            {page.views.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 w-12">
                            {page.percentage}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      هیچ داده‌ای موجود نیست
                    </p>
                  )}
                </div>
              </LiquidGlassCard>
            )}

            {/* بلاگ */}
            {activeTab === "blog" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LiquidGlassCard
                  className="p-6"
                  borderRadius="20px"
                  blurIntensity="lg"
                >
                  <h3 className="text-white font-bold mb-4">📝 آمار بلاگ</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">تعداد پست‌ها</span>
                      <span className="text-white font-bold">
                        {blogStats?.total_posts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">کل بازدید</span>
                      <span className="text-white font-bold">
                        {blogStats?.total_views || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">پربازدیدترین</span>
                      <span className="text-white text-sm truncate max-w-[150px]">
                        {blogStats?.most_viewed?.title || "-"}
                      </span>
                    </div>
                  </div>
                </LiquidGlassCard>
                <LiquidGlassCard
                  className="p-6"
                  borderRadius="20px"
                  blurIntensity="lg"
                >
                  <h3 className="text-white font-bold mb-4">
                    📊 نمودار بازدید بلاگ
                  </h3>
                  <div className="h-40 flex items-center justify-center text-gray-400">
                    {blogStats
                      ? "نمودار در حال توسعه..."
                      : "داده‌ای موجود نیست"}
                  </div>
                </LiquidGlassCard>
              </div>
            )}

            {/* رویدادها */}
            {activeTab === "events" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LiquidGlassCard
                  className="p-6"
                  borderRadius="20px"
                  blurIntensity="lg"
                >
                  <h3 className="text-white font-bold mb-4">
                    🎯 آمار رویدادها
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">تعداد رویدادها</span>
                      <span className="text-white font-bold">
                        {eventStats?.total_events || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">کل ثبت‌نام‌ها</span>
                      <span className="text-white font-bold">
                        {eventStats?.total_enrollments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">پربازدیدترین</span>
                      <span className="text-white text-sm truncate max-w-[150px]">
                        {eventStats?.most_viewed?.title || "-"}
                      </span>
                    </div>
                  </div>
                </LiquidGlassCard>
                <LiquidGlassCard
                  className="p-6"
                  borderRadius="20px"
                  blurIntensity="lg"
                >
                  <h3 className="text-white font-bold mb-4">
                    📊 نمودار رویدادها
                  </h3>
                  <div className="h-40 flex items-center justify-center text-gray-400">
                    {eventStats
                      ? "نمودار در حال توسعه..."
                      : "داده‌ای موجود نیست"}
                  </div>
                </LiquidGlassCard>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
