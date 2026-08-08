// src/lib/api/users.ts
import { apiClient } from "./client";

export const usersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const token = localStorage.getItem("token") || "";
    console.log("📤 usersAPI.getAll - token exists:", !!token);
    
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search || "");
    
    const endpoint = `/users${query.toString() ? "?" + query.toString() : ""}`;
    console.log("📤 usersAPI.getAll endpoint:", endpoint);
    
    const response = await apiClient.get(endpoint, token);
    console.log("📥 usersAPI.getAll response:", response);
    return response;
  },

  getById: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.get(`/users/${id}`, token);
  },

  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.post("/users", data, token);
  },

  update: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.put(`/users/${id}`, data, token);
  },

  updateRole: async (id: string, role: string) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.patch(`/users/${id}/role`, { role }, token);
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.delete(`/users/${id}`, token);
  },
};
