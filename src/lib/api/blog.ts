// src/lib/api/blog.ts
import { apiClient } from "./client";

export const blogAPI = {
  // دریافت همه پست‌ها
  getAll: (params?: { page?: number; limit?: number; tag?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/blog${query ? "?" + query : ""}`);
  },

  // دریافت پست با slug (عمومی)
  getBySlug: (slug: string) => {
    return apiClient.get(`/blog/slug/${slug}`);
  },

  // 🔥 دریافت پست با id (برای ویرایش)
  getById: (id: string) => {
    return apiClient.get(`/blog/id/${id}`);
  },

  // ایجاد پست جدید
  create: (data: any) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.post("/blog", data, token);
  },

  // ویرایش پست
  update: (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.put(`/blog/${id}`, data, token);
  },

  // حذف پست
  delete: (id: string) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.delete(`/blog/${id}`, token);
  },

  // دریافت تگ‌ها
  getTags: () => {
    return apiClient.get("/blog/tags");
  },
  // لایک کردن پست
  toggleLike: (id: string) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.post(`/blog/${id}/like`, {}, token);
  },

  // بررسی وضعیت لایک
  getLikeStatus: (id: string) => {
    const token = localStorage.getItem("token") || "";
    return apiClient.get(`/blog/${id}/like-status`, token);
  },
};
