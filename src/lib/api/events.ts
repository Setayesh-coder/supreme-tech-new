// src/lib/api/events.ts
import api from "./axios";

// ============== تایپ‌ها ==============
export interface EventResponse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  cover_image?: string;
  start_date: string;
  end_date: string;
  duration?: string;
  capacity: number;
  price: number;
  location?: string;
  category?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  cover_image?: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  capacity: number;
  price: number;
  location?: string;
  category?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface EventUpdate {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  cover_image?: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  capacity?: number;
  price?: number;
  location?: string;
  category?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface EventPaginatedResponse {
  total: number;
  page: number;
  size: number;
  items: EventResponse[];
}

// ============== تابع تولید اسلاگ ==============
export const generateSlug = (text: string): string => {
  if (!text || text.trim() === "") return "بدون-عنوان";

  return (
    text
      .trim()
      .toLowerCase()
      // ✅ حذف کاراکترهای خاص (فقط حروف فارسی، انگلیسی، اعداد و خط تیره باقی می‌مانند)
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, "")
      // ✅ تبدیل فاصله به خط تیره
      .replace(/\s+/g, "-")
      // ✅ حذف خط تیره‌های تکراری
      .replace(/-+/g, "-")
      // ✅ حذف خط تیره از ابتدا و انتها
      .replace(/^-+|-+$/g, "") ||
    // ✅ اگر خالی شد، مقدار پیش‌فرض
    "بدون-عنوان"
  );
};

// ============== API ==============
export const eventsAPI = {
  // 📋 عمومی - دریافت لیست رویدادها
  getAll: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    category?: string;
    is_active?: boolean;
  }): Promise<EventPaginatedResponse> => {
    const response = await api.get("/events", { params });
    return response.data;
  },

  // 📖 عمومی - دریافت با اسلاگ
  getBySlug: async (slug: string): Promise<EventResponse> => {
    const response = await api.get(`/events/slug/${slug}`);
    return response.data;
  },

  // 🔍 ادمین - دریافت با ID
  getById: async (id: string): Promise<EventResponse> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // ➕ ادمین - ایجاد رویداد جدید
  create: async (data: EventCreate): Promise<EventResponse> => {
    const response = await api.post("/events", data);
    return response.data;
  },

  // ✏️ ادمین - ویرایش رویداد
  update: async (id: string, data: EventUpdate): Promise<EventResponse> => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  // 🗑️ ادمین - حذف رویداد
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};
