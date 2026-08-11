// src/lib/api/messages.ts
import api from './axios';

export const messagesAPI = {
  create: async (data: any) => {
    const response = await api.post("/messages", data);
    return response.data;
  },

  getAll: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/messages", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getById: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getUserReplies: async (userId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/messages/user/${userId}/replies`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  reply: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(`/messages/${id}/reply`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // ✅ اضافه کردن markAsReplied
  markAsReplied: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(`/messages/${id}/replied`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(`/messages/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // ✅ اضافه کردن sendReply
  sendReply: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(`/messages/${id}/reply`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.delete(`/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};
