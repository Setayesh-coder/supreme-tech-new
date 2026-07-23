// src/lib/api/users.ts
import { apiClient } from "./client";

export const usersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const token = localStorage.getItem("token") || "";
    const query = new URLSearchParams(params as any).toString();
    const response = await apiClient.get(
      `/users${query ? "?" + query : ""}`,
      token,
    );
    return response;
  },

  getById: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get(`/users/${id}`, token);
    return response;
  },

  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/users", data, token);
    return response;
  },

  update: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.put(`/users/${id}`, data, token);
    return response;
  },

  // 🔥 تغییر نقش کاربر
  updateRole: async (id: string, role: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      `/users/${id}/role`,
      { role },
      token,
    );
    return response;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.delete(`/users/${id}`, token);
    return response;
  },
};
