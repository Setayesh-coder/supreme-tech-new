// src/lib/api/courses.ts
import api from "./axios";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  price: number;
  orginal_price: number;
  discount_value: number;
  discount_type: string;
  duration_hours?: number;
  instructor_name?: string;
  is_active: boolean;
  registration_start_date: string;
  registration_end_date: string;
  class_start_date: string;
  event_id?: string;
  event?: {
    id: string;
    title: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CourseCreate {
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  price?: number;
  orginal_price: number;
  duration_hours?: number;
  instructor_name?: string;
  registration_start_date: string;
  registration_end_date: string;
  class_start_date: string;
  is_active?: boolean;
  event_id?: string;
}

export interface CourseUpdate {
  title?: string;
  slug?: string;
  description?: string;
  cover_image?: string;
  price?: number;
  orginal_price: number;
  duration_hours?: number;
  registration_start_date: string;
  registration_end_date: string;
  class_start_date: string;
  instructor_name?: string;
  is_active?: boolean;
  event_id?: string;
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
    const response = await api.get("/courses", { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Course> => {
    const response = await api.get(`/courses/slug/${slug}`);
    return response.data;
  },

  getById: async (id: string): Promise<Course> => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  create: async (data: CourseCreate): Promise<Course> => {
    const response = await api.post("/courses", data);
    return response.data;
  },

  update: async (id: string, data: CourseUpdate): Promise<Course> => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};
