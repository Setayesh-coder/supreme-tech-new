// src/lib/api/settings.ts
import api from './axios';

export const settingsAPI = {
  getPublic: async () => {
    const response = await api.get("/settings/public");
    return response.data;
  },

  getAll: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/settings", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    console.log("📤 بروزرسانی تنظیمات با axios به:", "/settings");
    const response = await api.put("/settings", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  reset: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/settings/reset", {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};
