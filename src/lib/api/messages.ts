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
  is_replied: boolean;
  created_at: string;
  updated_at: string;
  reply?: string;
  replied_at?: string;
}

export interface CreateMessageRequest {
  name: string;
  email: string;
  phone: string;
  project_type: string;
  project_description: string;
}

export interface ReplyMessageRequest {
  reply: string;
}

export interface StatusMessageRequest {
  is_read?: boolean;
  is_replied?: boolean;
}

export interface MessagesResponse {
  total: number;
  page: number;
  size: number;
  items: Message[];
}

export const messagesAPI = {
  /**
   * 📤 ارسال فرم تماس فوری (عمومی)
   * POST /api/v1/messages
   */
  create: async (data: CreateMessageRequest): Promise<Message> => {
    console.log("📤 ارسال پیام به سرور:", data);
    const response = await api.post("/messages", data);
    return response.data;
  },

  /**
   * 📋 دریافت لیست تمامی پیام‌های دریافت شده (ویژه ادمین)
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
   * 📄 دریافت جزئیات یک پیام مشخص (ویژه ادمین)
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
   * 🗑️ حذف پیام (ویژه ادمین)
   * DELETE /api/v1/messages/{id}
   */
  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await api.delete(`/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * ✅ تغییر وضعیت خوانده‌شده (ویژه ادمین)
   * PATCH /api/v1/messages/{id}/read
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

  /**
   * ✅ تغییر وضعیت دستی پیام (ویژه ادمین)
   * PATCH /api/v1/messages/{id}/status
   *
   * @param id - شناسه پیام
   * @param data - شامل is_read و/یا is_replied
   */
  updateStatus: async (
    id: string,
    data: StatusMessageRequest,
  ): Promise<Message> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(`/messages/${id}/status`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * ⚠️ پاسخ به پیام (اگر اندپوینت جداگانه دارید)
   * در صورت عدم وجود، از updateStatus استفاده کنید
   */
  reply: async (id: string, data: ReplyMessageRequest): Promise<Message> => {
    const token = localStorage.getItem("token") || "";

    // ✅ تلاش با مسیرهای مختلف
    try {
      // مسیر 1: /messages/{id}/reply
      const response = await api.post(`/messages/${id}/reply`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      // اگر مسیر 1 کار نکرد، از updateStatus استفاده کن
      if (error.response?.status === 404) {
        console.log("🔄 مسیر reply پیدا نشد، استفاده از updateStatus...");
        return await messagesAPI.updateStatus(id, {
          is_replied: true,
          ...data,
        });
      }
      throw error;
    }
  },

  /**
   * 📌 علامت‌گذاری به عنوان پاسخ داده شده (ساده‌شده)
   * از updateStatus استفاده میکنه
   */
  markAsReplied: async (id: string): Promise<Message> => {
    return await messagesAPI.updateStatus(id, { is_replied: true });
  },
};
