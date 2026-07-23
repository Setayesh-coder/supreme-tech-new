// src/lib/api/tickets.ts
import { apiClient } from "./client";

export const ticketsAPI = {
  getAll: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get("/tickets", token);
    return response;
  },

  getById: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get(`/tickets/${id}`, token);
    return response;
  },

  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/tickets", data, token);
    return response;
  },

  createGroup: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/tickets/group", data, token);
    return response;
  },

  addMessage: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post(
      `/tickets/${id}/message`,
      data,
      token,
    );
    return response;
  },

  updateStatus: async (id: string, status: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      `/tickets/${id}/status`,
      { status },
      token,
    );
    return response;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.delete(`/tickets/${id}`, token);
    return response;
  },
};
