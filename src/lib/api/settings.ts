// src/lib/api/settings.ts
import { apiClient } from "./client";

export const settingsAPI = {
  getAll: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get("/settings", token);
    return response;
  },

  update: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.put("/settings", data, token);
    return response;
  },
};
