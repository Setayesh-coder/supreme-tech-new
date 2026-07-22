import { apiClient } from "./client";

export const enrollmentsAPI = {
  // ثبت نام در رویداد (عمومی)
  create: (data: {
    eventId: string;
    name: string;
    email: string;
    phone: string;
    message?: string;
  }) => {
    return apiClient.post("/enrollments", data);
  },

  // دریافت همه ثبت‌نام‌ها (ادمین)
  getAll: (params?: { eventId?: string; status?: string }, token?: string) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/enrollments${query ? "?" + query : ""}`, token);
  },

  // دریافت یک ثبت‌نام (ادمین)
  getById: (id: string, token: string) => {
    return apiClient.get(`/enrollments/${id}`, token);
  },

  // تغییر وضعیت (ادمین)
  updateStatus: (
    id: string,
    data: { status: string; notes?: string },
    token: string,
  ) => {
    return apiClient.put(`/enrollments/${id}`, data, token);
  },

  delete: (id: string, token: string) => {
    return apiClient.delete(`/enrollments/${id}`, token);
  },
};
