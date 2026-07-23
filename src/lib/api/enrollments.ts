// src/lib/api/enrollments.ts
import { apiClient } from "./client";

export const enrollmentsAPI = {
  // دریافت ثبت‌نام‌های کاربر جاری
  getMyEnrollments: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get("/enrollments/my", token);
    return response;
  },

  // ثبت‌نام در رویداد
  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/enrollments", data, token);
    return response;
  },

  // 🔥 پرداخت
  processPayment: async (enrollmentId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post(
      `/enrollments/${enrollmentId}/pay`,
      {},
      token,
    );
    return response;
  },

  // 🔥 دریافت لینک جلسه
  getMeetingLink: async (enrollmentId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get(
      `/enrollments/${enrollmentId}/meeting`,
      token,
    );
    return response;
  },

  // به‌روزرسانی وضعیت
  updateStatus: async (id: string, status: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      `/enrollments/${id}/status`,
      { status },
      token,
    );
    return response;
  },

  // به‌روزرسانی وضعیت پرداخت
  updatePayment: async (id: string, status: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      `/enrollments/${id}/payment`,
      { status },
      token,
    );
    return response;
  },

  // لغو ثبت‌نام
  cancel: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.delete(`/enrollments/${id}`, token);
    return response;
  },
};
