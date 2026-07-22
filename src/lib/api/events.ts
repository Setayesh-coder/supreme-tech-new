// src/lib/api/events.ts
import api from "./axios"; // ← درست

export const eventsAPI = {
  // دریافت همه رویدادها
  getAll: async (params?: any) => {
    const response = await api.get("/events", { params });
    return response.data;
  },

  // دریافت رویداد با slug
  getBySlug: async (slug: string) => {
    const response = await api.get(`/events/slug/${slug}`);
    return response.data;
  },

  // دریافت رویداد با id
  getById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // ایجاد رویداد جدید
  create: async (data: any) => {
    const response = await api.post("/events", data);
    return response.data;
  },

  // ویرایش رویداد
  update: async (id: string, data: any) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  // حذف رویداد
  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};
