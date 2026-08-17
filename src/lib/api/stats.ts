import api from "./axios";

export interface StatsOverview {
  total_views: number;
  unique_visitors: number;
  total_events: number;
  total_messages: number;
  unread_messages: number;
}

export interface DailyStats {
  date: string;
  views: number;
  unique_visitors: number;
}

export interface PageStats {
  path: string;
  views: number;
  percentage: number;
}

export const statsAPI = {
  // دریافت آمار کلی (داشبورد ادمین)
  getOverview: async (): Promise<StatsOverview> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/stats/overview", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // دریافت آمار روزانه (برای نمودار)
  getDaily: async (days: number = 7): Promise<DailyStats[]> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/stats/daily", {
      params: { days },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // دریافت آمار صفحات (پربازدیدترین‌ها)
  getPages: async (limit: number = 10): Promise<PageStats[]> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/stats/pages", {
      params: { limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // ثبت بازدید صفحه (عمومی - بدون توکن)
  trackView: async (data: {
    path: string;
    referrer?: string;
    user_agent?: string;
    ip_address?: string;
    session_id?: string;
  }) => {
    const response = await api.post("/stats/view", data);
    return response.data;
  },

  // ========== آمار بلاگ ==========

  // دریافت آمار کلی بلاگ
  getBlogStats: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/stats/blog", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // دریافت آمار یک پست خاص
  getBlogPostStats: async (postId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/stats/blog/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // ========== آمار رویدادها ==========

  // دریافت آمار کلی رویدادها
  getEventStats: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/stats/events", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // دریافت آمار یک رویداد خاص
  getEventStatsById: async (eventId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/stats/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // ========== آمار کلی سایت ==========

  // دریافت آمار کلی سایت (برای صفحه اصلی)
  getSiteStats: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/stats/site", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
