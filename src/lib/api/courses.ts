// src/lib/api/courses.ts
import api from "./axios";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  price: number;
  original_price: number;
  discount_value: number;
  discount_type: "percentage" | "fixed";
  duration_hours?: number;
  instructor_name?: string;
  is_active: boolean;
  registration_start_date?: string;
  registration_end_date?: string;
  class_start_date?: string;
  event_id?: string;
  event?: {
    id: string;
    title: string;
  };
  created_at: string;
  updated_at: string;
}

// ✅ اضافه کردن price به CourseCreate
export interface CourseCreate {
  title: string;
  slug: string;
  description?: string | null;
  cover_image?: string | null;
  original_price: number;
  price: number; // ✅ اضافه شد
  discount_value?: number | null;
  discount_type?: "percentage" | "fixed" | null;
  duration_hours?: number | null;
  instructor_name?: string | null;
  is_active?: boolean;
  event_id?: string | null;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  class_start_date?: string | null;
}

export interface CourseUpdate {
  title?: string;
  slug?: string;
  description?: string | null;
  cover_image?: string | null;
  original_price?: number;
  price?: number; // ✅ اضافه شد
  discount_value?: number | null;
  discount_type?: "percentage" | "fixed" | null;
  duration_hours?: number | null;
  instructor_name?: string | null;
  is_active?: boolean;
  event_id?: string | null;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  class_start_date?: string | null;
}

export interface CoursePaginatedResponse {
  items: Course[];
  total: number;
  page: number;
  limit: number;
}

export const generateSlug = (text: string): string => {
  if (!text || text.trim() === "") return "بدون-عنوان";
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "بدون-عنوان"
  );
};

export const coursesAPI = {
  getAll: async (params?: {
    eventId?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<CoursePaginatedResponse> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/courses", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Course> => {
    const response = await api.get(`/courses/slug/${slug}`);
    return response.data;
  },

  getById: async (id: string): Promise<Course> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  create: async (data: CourseCreate): Promise<Course> => {
    const token = localStorage.getItem("token") || "";
    const payload = {
      ...data,
      discount_type: data.discount_type || "percentage",
    };
    console.log("📤 ارسال به سرور:", payload);
    const response = await api.post("/courses", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (id: string, data: CourseUpdate): Promise<Course> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.put(`/courses/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.delete(`/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
