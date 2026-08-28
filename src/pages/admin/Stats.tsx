// src/pages/admin/Stats.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { statsAPI } from "../../lib/api/stats";
import { blogAPI } from "../../lib/api/blog";
import { coursesAPI } from "../../lib/api/courses";
import {
  RefreshCw,
  BarChart3,
  Users,
  Eye,
  FileText,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  Clock,
  BookOpen,
  Calendar,
  Activity,
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

interface OverviewStats {
  total_views: number;
  unique_visitors: number;
  total_events: number;
  total_messages: number;
  unread_messages: number;
}

export default function Stats() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  const [blogStats, setBlogStats] = useState<any>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);

      // 1. دریافت آمار کلی
      try {
        const overviewData = await statsAPI.getOverview();
        setOverview(overviewData);
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار کلی:", e);
        setOverview({
          total_views: 0,
          unique_visitors: 0,
          total_events: 0,
          total_messages: 0,
          unread_messages: 0,
        });
      }

      // 2. دریافت آمار روزانه
      try {
        const daily = await statsAPI.getDaily(days);
        setDailyStats(daily || []);
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار روزانه:", e);
        setDailyStats([]);
      }

      // 3. دریافت آمار صفحات
      try {
        const pages = await statsAPI.getPages(10);
        setPageStats(pages || []);
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار صفحات:", e);
        setPageStats([]);
      }

      // 4. دریافت آمار بلاگ از blogAPI
      try {
        const blogPosts = await blogAPI.getAll({ limit: 100 });
        if (blogPosts && blogPosts.items && blogPosts.items.length > 0) {
          const posts = blogPosts.items;
          setBlogStats({
            total_posts: posts.length,
            total_views: posts.reduce(
              (sum, p) => sum + (p.views_count || 0),
              0,
            ),
            total_likes: posts.reduce(
              (sum, p) => sum + (p.likes_count || 0),
              0,
            ),
            most_viewed:
              [...posts].sort(
                (a, b) => (b.views_count || 0) - (a.views_count || 0),
              )[0] || null,
            recent_posts: [...posts]
              .sort(
                (a, b) =>
                  new Date(b.created_at || 0).getTime() -
                  new Date(a.created_at || 0).getTime(),
              )
              .slice(0, 5),
          });
        } else {
          setBlogStats(null);
        }
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار بلاگ:", e);
        setBlogStats(null);
      }

      // 5. دریافت آمار رویدادها از coursesAPI
      try {
        const courses = await coursesAPI.getAll({ limit: 100 });
        const items = courses.items || [];
        if (items.length > 0) {
          setEventStats({
            total_events: items.length,
            most_viewed:
              [...items].sort(
                (a: any, b: any) => (b.views_count || 0) - (a.views_count || 0),
              )[0] || null,
            upcoming_events: items
              .filter(
                (c: any) => c.startDate && new Date(c.startDate) > new Date(),
              )
              .sort(
                (a: any, b: any) =>
                  new Date(a.startDate).getTime() -
                  new Date(b.startDate).getTime(),
              )
              .slice(0, 5),
          });
        } else {
          setEventStats(null);
        }
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار رویدادها:", e);
        setEventStats(null);
      }
    } catch (error) {
      console.error("❌ خطا:", error);
      setError("خطا در دریافت آمار");
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

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-center text-sm">
            ❌ {error}
          </div>
        )}

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
                      {overview?.total_views?.toLocaleString() ||
                        totalViews.toLocaleString()}
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
                      {overview?.unique_visitors?.toLocaleString() ||
                        totalVisitors.toLocaleString()}
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

                {/* نمودار روزانه */}
                <LiquidGlassCard
                  className="p-6"
                  borderRadius="20px"
                  blurIntensity="lg"
                >
                  <h3 className="text-white font-bold mb-4">
                    📈 بازدید روزانه
                  </h3>
                  {dailyStats.length > 0 ? (
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
                            className="flex-1 flex flex-col items-center gap-1 group"
                          >
                            <div
                              className="w-full bg-blue-500/50 rounded-t hover:bg-blue-400 transition-all duration-300 relative group-hover:scale-y-110 origin-bottom"
                              style={{ height: `${Math.max(height, 5)}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {day.views.toLocaleString()} بازدید
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-500">
                              {new Date(day.date).toLocaleDateString("fa-IR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-8">
                      هیچ داده‌ای موجود نیست
                    </p>
                  )}
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
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
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
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-bold">📝 آمار بلاگ</h3>
                  </div>
                  {blogStats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <span className="text-gray-400">تعداد پست‌ها</span>
                        <span className="text-white font-bold">
                          {blogStats.total_posts}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <span className="text-gray-400">کل بازدید</span>
                        <span className="text-white font-bold">
                          {blogStats.total_views.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <span className="text-gray-400">کل لایک‌ها</span>
                        <span className="text-white font-bold">
                          {blogStats.total_likes?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <span className="text-gray-400">پربازدیدترین</span>
                        <span className="text-white text-sm truncate max-w-[150px]">
                          {blogStats.most_viewed?.title || "-"}
                          {blogStats.most_viewed && (
                            <span className="text-xs text-gray-500 block">
                              {blogStats.most_viewed.views_count?.toLocaleString() ||
                                0}{" "}
                              بازدید
                            </span>
                          )}
                        </span>
                      </div>
                      {blogStats.recent_posts &&
                        blogStats.recent_posts.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-gray-500 mb-2">
                              📄 آخرین پست‌ها:
                            </p>
                            {blogStats.recent_posts
                              .slice(0, 3)
                              .map((post: any) => (
                                <div
                                  key={post.id}
                                  className="flex justify-between text-sm py-1"
                                >
                                  <span className="text-gray-400 truncate max-w-[120px]">
                                    {post.title}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    {post.views_count || 0} 👁️
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>هیچ پستی در بلاگ وجود ندارد</p>
                      <p className="text-xs text-gray-500 mt-1">
                        اولین پست خود را ایجاد کنید
                      </p>
                    </div>
                  )}
                </LiquidGlassCard>
                <LiquidGlassCard
                  className="p-6"
                  borderRadius="20px"
                  blurIntensity="lg"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-bold">📊 عملکرد بلاگ</h3>
                  </div>
                  {blogStats ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-xs text-gray-500">
                            میانگین بازدید
                          </p>
                          <p className="text-white font-bold">
                            {blogStats.total_posts > 0
                              ? Math.round(
                                  blogStats.total_views / blogStats.total_posts,
                                ).toLocaleString()
                              : 0}{" "}
                            بازدید
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-xs text-gray-500">وضعیت</p>
                          <p className="text-white font-bold">
                            {blogStats.total_posts > 0 ? "فعال" : "بدون پست"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>داده‌ای برای نمایش وجود ندارد</p>
                    </div>
                  )}
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
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    <h3 className="text-white font-bold">🎯 آمار رویدادها</h3>
                  </div>
                  {eventStats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <span className="text-gray-400">تعداد رویدادها</span>
                        <span className="text-white font-bold">
                          {eventStats.total_events}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <span className="text-gray-400">پربازدیدترین</span>
                        <span className="text-white text-sm truncate max-w-[150px]">
                          {eventStats.most_viewed?.title || "-"}
                          {eventStats.most_viewed && (
                            <span className="text-xs text-gray-500 block">
                              {eventStats.most_viewed.views_count?.toLocaleString() ||
                                0}{" "}
                              بازدید
                            </span>
                          )}
                        </span>
                      </div>
                      {eventStats.upcoming_events &&
                        eventStats.upcoming_events.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-gray-500 mb-2">
                              🗓️ رویدادهای پیش‌رو:
                            </p>
                            {eventStats.upcoming_events
                              .slice(0, 3)
                              .map((event: any) => (
                                <div
                                  key={event.id}
                                  className="flex justify-between text-sm py-1"
                                >
                                  <span className="text-gray-400 truncate max-w-[120px]">
                                    {event.title}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    {event.startDate
                                      ? new Date(
                                          event.startDate,
                                        ).toLocaleDateString("fa-IR")
                                      : "نامشخص"}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>هیچ رویدادی وجود ندارد</p>
                      <p className="text-xs text-gray-500 mt-1">
                        اولین رویداد خود را ایجاد کنید
                      </p>
                    </div>
                  )}
                </LiquidGlassCard>
                <LiquidGlassCard
                  className="p-6"
                  borderRadius="20px"
                  blurIntensity="lg"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-bold">📊 عملکرد رویدادها</h3>
                  </div>
                  {eventStats ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-xs text-gray-500">وضعیت</p>
                          <p className="text-white font-bold">
                            {eventStats.total_events > 0
                              ? `${eventStats.total_events} رویداد فعال`
                              : "بدون رویداد"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>داده‌ای برای نمایش وجود ندارد</p>
                    </div>
                  )}
                </LiquidGlassCard>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
