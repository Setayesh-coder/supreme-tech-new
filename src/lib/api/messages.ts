// src/lib/api/messages.ts
import api from "./axios";

// ✅ تایپ‌های مربوط به پیام‌ها بر اساس ساختار جدید API
export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  project_type: string;
  project_description: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  reply?: string;
  replied_at?: string;
}

// ✅ تایپ برای درخواست ایجاد پیام
export interface CreateMessageRequest {
  name: string;
  email: string;
  phone: string;
  project_type: string;
  project_description: string;
}

// ✅ تایپ برای پاسخ خطای اعتبارسنجی
export interface ValidationError {
  type: string;
  loc: string[];
  msg: string;
  input: any;
}

export interface ErrorResponse {
  detail: ValidationError[] | string;
}

export interface ReplyMessageRequest {
  reply: string;
}

export interface MessagesResponse {
  total: number;
  page: number;
  size: number;
  items: Message[];
}

export const messagesAPI = {
  /**
   * ارسال فرم تماس فوری (عمومی)
   * POST /api/v1/messages
   */
  create: async (data: CreateMessageRequest): Promise<Message> => {
    console.log("📤 ارسال پیام به سرور:", data);
    const response = await api.post("/messages", data);
    return response.data;
  },

  /**
   * دریافت لیست تمامی پیام‌های دریافت شده (ویژه ادمین)
   * GET /api/v1/messages
   */
  getAll: async (params?: {
    page?: number;
    size?: number;
    is_read?: boolean;
    search?: string;
  }): Promise<MessagesResponse> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/messages", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  },

  /**
   * دریافت جزئیات یک پیام مشخص (ویژه ادمین)
   * GET /api/v1/messages/{id}
   */
  getById: async (id: string): Promise<Message> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * حذف پیام (ویژه ادمین)
   * DELETE /api/v1/messages/{id}
   */
  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await api.delete(`/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * پاسخ به پیام (ویژه ادمین)
   */
  reply: async (id: string, data: ReplyMessageRequest): Promise<Message> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(`/messages/${id}/reply`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * علامت‌گذاری به عنوان پاسخ داده شده
   */
  markAsReplied: async (id: string): Promise<Message> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(
      `/messages/${id}/replied`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  /**
   * علامت‌گذاری به عنوان خوانده شده
   */
  markAsRead: async (id: string): Promise<Message> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(
      `/messages/${id}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};
