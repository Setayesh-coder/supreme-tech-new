import { apiClient } from "./client";

export const blogAPI = {
  // دریافت همه پست‌ها (عمومی)
  getAll: (params?: { page?: number; limit?: number; tag?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/blog${query ? "?" + query : ""}`);
  },

  // دریافت یک پست با slug (عمومی)
  getBySlug: (slug: string) => {
    return apiClient.get(`/blog/${slug}`);
  },

  // ایجاد پست جدید (ادمین)
  create: (data: any, token: string) => {
    return apiClient.post("/blog", data, token);
  },

  // ویرایش پست (ادمین)
  update: (id: string, data: any, token: string) => {
    return apiClient.put(`/blog/${id}`, data, token);
  },

  // حذف پست (ادمین)
  delete: (id: string, token: string) => {
    return apiClient.delete(`/blog/${id}`, token);
  },

  // دریافت تگ‌ها
  getTags: () => {
    return apiClient.get("/blog/tags");
  },
};
