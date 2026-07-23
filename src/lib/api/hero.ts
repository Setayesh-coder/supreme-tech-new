// src/lib/api/hero.ts
import { apiClient } from "./client";

export const heroAPI = {
  getAll: async () => {
    const response = await apiClient.get("/hero");
    return response;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/hero/${id}`);
    return response;
  },

  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/hero", data, token);
    return response;
  },

  update: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.put(`/hero/${id}`, data, token);
    return response;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.delete(`/hero/${id}`, token);
    return response;
  },

  reorder: async (items: { id: string; order: number }[]) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.put("/hero/reorder", { items }, token);
    return response;
  },
};
