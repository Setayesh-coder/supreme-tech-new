import { apiClient } from "./client";

export const coursesAPI = {
  // دریافت همه دوره‌ها
  getAll: async (params?: { eventId?: string; limit?: number; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.eventId) query.append("eventId", params.eventId);
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.page) query.append("page", String(params.page));
    
    const url = `/courses${query.toString() ? "?" + query.toString() : ""}`;
    const response = await apiClient.get(url);
    return response;
  },

  // دریافت دوره‌های یک ایونت
  getByEvent: async (eventId: string) => {
    const response = await apiClient.get(`/courses/event/${eventId}`);
    return response;
  },

  // دریافت یک دوره
  getById: async (id: string) => {
    const response = await apiClient.get(`/courses/${id}`);
    return response;
  },

  // ایجاد دوره (ادمین)
  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/courses", data, token);
    return response;
  },

  // بروزرسانی دوره (ادمین)
  update: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.put(`/courses/${id}`, data, token);
    return response;
  },

  // حذف دوره (ادمین)
  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.delete(`/courses/${id}`, token);
    return response;
  },

  // ثبت‌نام در دوره
  enroll: async (courseId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post(`/courses/${courseId}/enroll`, {}, token);
    return response;
  },
};
