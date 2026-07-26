// src/lib/api/admin.ts
import { apiClient } from "./client";

export const adminAPI = {
  login: async (phone: string, password: string) => {
    const response = await apiClient.post("/admin/login", { phone, password });
    return response;
  },

  getStats: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get("/stats/overview", token);
    return response;
  },
};
