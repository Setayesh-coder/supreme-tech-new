// src/pages/admin/Dashboard.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { statsAPI } from "../../lib/api/stats";
import { blogAPI } from "../../lib/api/blog";
import { coursesAPI } from "../../lib/api/courses";
import { usersAPI } from "../../lib/api/users";
import { messagesAPI } from "../../lib/api/messages";
import { Link } from "react-router-dom";
import { DailyChart } from "../../components/admin/DailyChartRecharts"; // ✅ اضافه کردن
import {
  RefreshCw,
  Users,
  Eye,
  FileText,
  CalendarDays,
  MessageSquare,
  Activity,
  BarChart3,
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [pageStats, setPageStats] = useState<any[]>([]);
  const [blogStats, setBlogStats] = useState<any>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. آمار کلی
      try {
        const overview = await statsAPI.getOverview();
        console.log("📊 آمار کلی:", overview);
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار کلی:", e);
      }

      // 2. آمار روزانه
      try {
        const daily = await statsAPI.getDaily(7);
        setDailyStats(daily || []);
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار روزانه:", e);
        setDailyStats([]);
      }

      // 3. آمار صفحات
      try {
        const pages = await statsAPI.getPages(5);
        setPageStats(pages || []);
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار صفحات:", e);
        setPageStats([]);
      }

      // 4. آمار بلاگ
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
          });
        } else {
          setBlogStats(null);
        }
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار بلاگ:", e);
        setBlogStats(null);
      }

      // 5. آمار رویدادها
      try {
        const courses = await coursesAPI.getAll({ limit: 100 });
        const items = courses.items || [];
        if (items.length > 0) {
          const coursesWithStats = items as any[];
          setEventStats({
            total_events: items.length,
            most_viewed:
              [...coursesWithStats].sort(
                (a, b) => (b.views_count || 0) - (a.views_count || 0),
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
              .slice(0, 3),
          });
        } else {
          setEventStats(null);
        }
      } catch (e) {
        console.warn("⚠️ خطا در دریافت آمار رویدادها:", e);
        setEventStats(null);
      }

      // 6. تعداد کاربران
      try {
        const users = await usersAPI.getAll({ limit: 1 });
        setTotalUsers(users.total || 0);
      } catch (e) {
        console.warn("⚠️ خطا در دریافت تعداد کاربران:", e);
        setTotalUsers(0);
      }

      // 7. پیام‌های خوانده نشده
      try {
        const messages = await messagesAPI.getAll({ is_read: false });
        setUnreadMessages(messages.total || 0);
      } catch (e) {
        console.warn("⚠️ خطا در دریافت پیام‌ها:", e);
        setUnreadMessages(0);
      }
    } catch (error) {
      console.error("❌ خطا:", error);
      setError("خطا در دریافت اطلاعات داشبورد");
    } finally {
      setLoading(false);
    }
  };

  const totalViews = dailyStats.reduce((sum, d) => sum + d.views, 0);
  const totalVisitors = dailyStats.reduce(
    (sum, d) => sum + d.unique_visitors,
    0,
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* هدر */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              📊 داشبورد مدیریت
            </h1>
            <p className="text-gray-400 text-sm mt-1">نمای کلی از وضعیت سایت</p>
          </div>
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            iconPosition="left"
            onClick={fetchDashboardData}
          >
            بروزرسانی
          </GlassButton>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-center text-sm">
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* کارت‌های آمار */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
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
                <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">کاربران</p>
              </LiquidGlassCard>

              <LiquidGlassCard
                className="p-4 text-center"
                borderRadius="16px"
                blurIntensity="sm"
              >
                <FileText className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
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

              <LiquidGlassCard
                className="p-4 text-center"
                borderRadius="16px"
                blurIntensity="sm"
              >
                <MessageSquare className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {unreadMessages}
                </p>
                <p className="text-xs text-gray-500">پیام‌های خوانده نشده</p>
              </LiquidGlassCard>
            </div>

            {/* ✅ نمودار بازدید ۷ روز اخیر */}
            <DailyChart data={dailyStats} loading={loading} />

            {/* دو ستون پایین */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* پربازدیدترین صفحات */}
              <LiquidGlassCard
                className="p-6"
                borderRadius="20px"
                blurIntensity="lg"
              >
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  پربازدیدترین صفحات
                </h3>
                <div className="space-y-2">
                  {pageStats.length > 0 ? (
                    pageStats.slice(0, 5).map((page, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <span className="text-gray-300 text-sm truncate max-w-[150px]">
                          {page.path}
                        </span>
                        <span className="text-white font-bold text-sm">
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      هیچ داده‌ای موجود نیست
                    </p>
                  )}
                </div>
                <Link
                  to="/admin/stats"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-3 block text-center"
                >
                  مشاهده همه آمار →
                </Link>
              </LiquidGlassCard>

              {/* آخرین فعالیت‌ها */}
              <LiquidGlassCard
                className="p-6"
                borderRadius="20px"
                blurIntensity="lg"
              >
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  آخرین فعالیت‌ها
                </h3>
                <div className="space-y-2">
                  {blogStats?.most_viewed && (
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">
                        پربازدیدترین پست
                      </span>
                      <span className="text-white font-bold text-sm truncate max-w-[100px]">
                        {blogStats.most_viewed.title}
                      </span>
                    </div>
                  )}

                  {eventStats?.most_viewed && (
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">
                        پربازدیدترین رویداد
                      </span>
                      <span className="text-white font-bold text-sm truncate max-w-[100px]">
                        {eventStats.most_viewed.title}
                      </span>
                    </div>
                  )}

                  {unreadMessages > 0 && (
                    <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <span className="text-yellow-400 text-sm">
                        پیام‌های خوانده نشده
                      </span>
                      <span className="text-yellow-400 font-bold text-sm">
                        {unreadMessages}
                      </span>
                    </div>
                  )}

                  {eventStats?.upcoming_events &&
                    eventStats.upcoming_events.length > 0 && (
                      <div className="p-2 bg-white/5 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">
                          رویدادهای پیش‌رو:
                        </p>
                        {eventStats.upcoming_events
                          .slice(0, 2)
                          .map((event: any) => (
                            <div
                              key={event.id}
                              className="flex justify-between text-sm py-0.5"
                            >
                              <span className="text-gray-400 truncate max-w-[100px]">
                                {event.title}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {event.startDate
                                  ? new Date(
                                      event.startDate,
                                    ).toLocaleDateString("fa-IR")
                                  : ""}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              </LiquidGlassCard>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
