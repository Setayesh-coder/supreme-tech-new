// src/lib/api/events.ts
import api from "./axios";

export const eventsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get("/events", { params });
    return response.data;
  },

  getBySlug: async (slug: string) => {
    console.log("📤 دریافت رویداد با slug:", slug);
    const response = await api.get(`/events/slug/${slug}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/events", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
};
