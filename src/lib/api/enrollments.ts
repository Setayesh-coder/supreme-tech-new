// src/lib/api/enrollments.ts
import api from './axios';

export const enrollmentsAPI = {
  getMyEnrollments: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/enrollments/my", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/enrollments", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  processPayment: async (enrollmentId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(`/enrollments/${enrollmentId}/pay`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // ✅ اضافه کردن getEventEnrollments
  getEventEnrollments: async (eventId: string, params?: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/enrollments/event/${eventId}`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getByEvent: async (eventId: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/enrollments/event/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(`/enrollments/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // ✅ اضافه کردن sendMeetingLink
  sendMeetingLink: async (enrollmentId: string, meetingLink: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(`/enrollments/${enrollmentId}/meeting-link`, { meetingLink }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.delete(`/enrollments/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};
