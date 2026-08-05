import { apiClient } from "./client";

export const settingsAPI = {
  // 🔥 دریافت تنظیمات عمومی (بدون نیاز به توکن)
  getPublic: async () => {
    const response = await apiClient.get("/settings/public");
    return response;
  },

  // دریافت تنظیمات کامل (فقط ادمین - نیاز به توکن)
  getAll: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get("/settings", token);
    return response;
  },

  // بروزرسانی تنظیمات (فقط ادمین)
  update: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.put("/settings", data, token);
    return response;
  },

  // ریست تنظیمات (فقط ادمین)
  reset: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/settings/reset", {}, token);
    return response;
  },
};
