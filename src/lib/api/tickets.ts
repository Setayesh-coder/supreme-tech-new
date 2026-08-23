// src/lib/api/tickets.ts
import api from "./axios";

// ✅ تایپ‌های مربوط به تیکت
export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  department?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "PENDING" | "ANSWERED" | "CLOSED";
  creator_id: string;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
  members?: string[];
}

// ✅ تایپ برای ایجاد تیکت
export interface CreateTicketRequest {
  title: string;
  message: string;
  department?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

// ✅ تایپ برای ایجاد تیکت گروهی
export interface CreateGroupTicketRequest {
  title: string;
  message: string;
  department?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  members: string[];
}

// ✅ تایپ برای تغییر وضعیت
export interface UpdateStatusRequest {
  status: "OPEN" | "PENDING" | "ANSWERED" | "CLOSED";
}

// ✅ تایپ برای پاسخ API
export interface TicketsResponse {
  items: Ticket[];
  total: number;
  page?: number;
  limit?: number;
}

export const ticketsAPI = {
  /**
   * دریافت لیست تمام تیکت‌ها (پنل مدیریت)
   * GET /api/v1/tickets
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<TicketsResponse> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/tickets", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  },

  /**
   * دریافت لیست تیکت‌های ایجادشده توسط کاربر متصل
   * GET /api/v1/tickets/my
   */
  getMyTickets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<TicketsResponse> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/tickets/my", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  },

  /**
   * دریافت جزئیات و تاریخچه پیام‌های یک تیکت مشخص
   * GET /api/v1/tickets/{id}
   */
  getById: async (id: string): Promise<Ticket> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * ایجاد تیکت پشتیبانی جدید
   * POST /api/v1/tickets
   */
  create: async (data: CreateTicketRequest): Promise<Ticket> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/tickets", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * ایجاد تیکت پشتیبانی گروهی
   * POST /api/v1/tickets/group
   */
  createGroup: async (data: CreateGroupTicketRequest): Promise<Ticket> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/tickets/group", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * ارسال پاسخ یا پیام جدید روی تیکت
   * POST /api/v1/tickets/{id}/message
   */
  addMessage: async (
    ticketId: string,
    message: string,
  ): Promise<TicketMessage> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(
      `/tickets/${ticketId}/message`,
      { message },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  /**
   * تغییر وضعیت تیکت
   * PATCH /api/v1/tickets/{id}/status
   */
  updateStatus: async (
    ticketId: string,
    status: "OPEN" | "PENDING" | "ANSWERED" | "CLOSED",
  ): Promise<Ticket> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(
      `/tickets/${ticketId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  /**
   * حذف تیکت
   * DELETE /api/v1/tickets/{id}
   */
  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await api.delete(`/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
