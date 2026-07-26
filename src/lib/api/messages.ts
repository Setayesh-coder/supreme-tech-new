// src/lib/api/messages.ts
import { apiClient } from "./client";

export const messagesAPI = {
  // 🔥 ایجاد پیام جدید (عمومی - بدون نیاز به احراز هویت)
  create: async (data: {
    name: string;
    email?: string;
    phone?: string;
    subject: string;
    message: string;
    userId?: string;
  }) => {
    const response = await apiClient.post("/messages", data);
    return response;
  },

  // دریافت همه پیام‌ها (فقط ادمین)
  getAll: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get("/messages", token);
    return response;
  },

  // دریافت پیام با ID (فقط ادمین)
  getById: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get(`/messages/${id}`, token);
    return response;
  },

  // 🔥 ارسال پاسخ (ادمین)
  sendReply: async (id: string, data: { reply: string; to: string }) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post(`/messages/${id}/reply`, data, token);
    return response;
  },

  // 🔥 دریافت پاسخ‌های کاربر (برای پروفایل)
  getUserReplies: async (userId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get(
      `/messages/user/${userId}/replies`,
      token,
    );
    return response;
  },

  // علامت‌گذاری به عنوان خوانده شده (فقط ادمین)
  markAsRead: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(`/messages/${id}/read`, {}, token);
    return response;
  },

  // علامت‌گذاری به عنوان پاسخ داده شده (فقط ادمین)
  markAsReplied: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      `/messages/${id}/replied`,
      {},
      token,
    );
    return response;
  },

  // حذف پیام (فقط ادمین)
  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.delete(`/messages/${id}`, token);
    return response;
  },
};
