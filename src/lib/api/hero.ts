// src/lib/api/hero.ts
import api from "./axios";

export interface HeroSlide {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  tagline?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const heroAPI = {
  getAll: async (): Promise<HeroSlide[]> => {
    const response = await api.get("/hero");
    const data = response.data?.data || response.data || [];
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      tagline: item.tagline || "",
      image_url: item.image_url || "",
      button_text: item.button_text,
      button_link: item.button_link,
      order: item.order || 0,
      is_active: item.is_active !== undefined ? item.is_active : true,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  },

  getById: async (id: string): Promise<HeroSlide> => {
    const response = await api.get(`/hero/${id}`);
    const item = response.data?.data || response.data;
    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      tagline: item.tagline,
      image_url: item.image_url || "",
      button_text: item.button_text,
      button_link: item.button_link,
      order: item.order || 0,
      is_active: item.is_active !== undefined ? item.is_active : true,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  },

  create: async (data: Partial<HeroSlide>): Promise<HeroSlide> => {
    const token = localStorage.getItem("token") || "";
    const payload = {
      title: data.title,
      subtitle: data.subtitle || null,
      description: data.description || null,
      tagline: data.tagline || null,
      image_url: data.image_url || null,
      button_text: data.button_text || null,
      button_link: data.button_link || null,
      order: data.order || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
    };
    const response = await api.post("/hero", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data || response.data;
  },

  update: async (id: string, data: Partial<HeroSlide>): Promise<HeroSlide> => {
    const token = localStorage.getItem("token") || "";
    const payload = {
      title: data.title,
      subtitle: data.subtitle || null,
      description: data.description || null,
      tagline: data.tagline || null,
      image_url: data.image_url || null,
      button_text: data.button_text || null,
      button_link: data.button_link || null,
      order: data.order,
      is_active: data.is_active !== undefined ? data.is_active : true,
    };
    const response = await api.put(`/hero/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await api.delete(`/hero/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  reorder: async (items: { id: string; order: number }[]): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await api.put(
      "/hero/reorder",
      { items },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },
};
