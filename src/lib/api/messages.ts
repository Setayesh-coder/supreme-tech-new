// src/lib/api/messages.ts
import { apiClient } from "./client";

export const messagesAPI = {
  getAll: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get("/messages", token);
    return response;
  },

  getById: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get(`/messages/${id}`, token);
    return response;
  },

  markAsRead: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(`/messages/${id}/read`, {}, token);
    return response;
  },

  markAsReplied: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      `/messages/${id}/replied`,
      {},
      token,
    );
    return response;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.delete(`/messages/${id}`, token);
    return response;
  },
};
