import { apiClient } from "./client";

export const statsAPI = {
  // دریافت آمار کلی (ادمین)
  getOverview: (token: string) => {
    return apiClient.get("/stats/overview", token);
  },

  // دریافت آمار روزانه (ادمین)
  getDaily: (days?: number, token?: string) => {
    const query = days ? `?days=${days}` : "";
    return apiClient.get(`/stats/daily${query}`, token);
  },

  // دریافت آمار صفحات (ادمین)
  getPages: (token: string) => {
    return apiClient.get("/stats/pages", token);
  },

  // ثبت بازدید (عمومی)
  trackView: (data: {
    path: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
    sessionId?: string;
  }) => {
    return apiClient.post("/stats/view", data);
  },
};
