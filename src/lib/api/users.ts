import { apiClient } from "./client";

export const usersAPI = {
  // دریافت همه کاربران (ادمین)
  getAll: (
    params?: { page?: number; limit?: number; search?: string },
    token?: string,
  ) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/users${query ? "?" + query : ""}`, token);
  },

  // دریافت کاربر با شماره تلفن
  getByPhone: (phone: string, token: string) => {
    return apiClient.get(`/users/${phone}`, token);
  },

  // بروزرسانی کاربر
  update: (id: string, data: any, token: string) => {
    return apiClient.put(`/users/${id}`, data, token);
  },

  // حذف کاربر
  delete: (id: string, token: string) => {
    return apiClient.delete(`/users/${id}`, token);
  },
};
