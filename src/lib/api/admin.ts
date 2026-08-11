// src/lib/api/admin.ts
import api from './axios';

export const adminAPI = {
  login: async (data: { phone: string; password: string }) => {
    const response = await api.post("/admin/login", data);
    // ✅ پاسخ ممکن است مستقیماً شامل token و user باشد یا داخل data
    const result = response.data;
    return {
      success: result.success !== undefined ? result.success : true,
      token: result.token || result.access_token || null,
      user: result.user || result.admin || null,
      ...result
    };
  },

  getStats: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/stats/overview", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getProfile: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/admin/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.put("/admin/profile", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  changePassword: async (data: { current: string; new: string }) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch("/admin/change-password", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};
