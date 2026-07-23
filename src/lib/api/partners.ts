// src/lib/api/partners.ts
import { apiClient } from "./client";

export const partnersAPI = {
  getAll: async () => {
    const response = await apiClient.get("/partners?isActive=true");
    return response;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/partners/${id}`);
    return response;
  },

  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/partners", data, token);
    return response;
  },

  update: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.put(`/partners/${id}`, data, token);
    return response;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.delete(`/partners/${id}`, token);
    return response;
  },
};
