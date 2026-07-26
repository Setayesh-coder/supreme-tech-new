// src/lib/api/enrollments.ts
import { apiClient } from "./client";

export const enrollmentsAPI = {
  // دریافت ثبت‌نام‌های کاربر جاری
  getMyEnrollments: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get("/enrollments/my", token);
    return response;
  },

  // ایجاد ثبت‌نام جدید
  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/enrollments", data, token);
    return response;
  },

  // پردازش پرداخت
  processPayment: async (enrollmentId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post(
      `/enrollments/${enrollmentId}/pay`,
      {},
      token,
    );
    return response;
  },

  // دریافت لینک جلسه
  getMeetingLink: async (enrollmentId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get(
      `/enrollments/${enrollmentId}/meeting`,
      token,
    );
    return response;
  },

  // 🔥 دریافت ثبت‌نام‌های یک رویداد (برای ادمین و کارمند)
  getEventEnrollments: async (
    eventId: string,
    params?: { status?: string; search?: string },
  ) => {
    const token = localStorage.getItem("token") || "";
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    const url = `/enrollments/event/${eventId}${query.toString() ? `?${query.toString()}` : ""}`;
    const response = await apiClient.get(url, token);
    return response;
  },

  // 🔥 به‌روزرسانی وضعیت ثبت‌نام
  updateStatus: async (id: string, status: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      `/enrollments/${id}/status`,
      { status },
      token,
    );
    return response;
  },

  // 🔥 ارسال لینک جلسه
  sendMeetingLink: async (id: string, meetingLink: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post(
      `/enrollments/${id}/meeting-link`,
      { meetingLink },
      token,
    );
    return response;
  },

  // به‌روزرسانی وضعیت پرداخت
  updatePayment: async (id: string, paymentStatus: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      `/enrollments/${id}/payment`,
      { paymentStatus },
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
