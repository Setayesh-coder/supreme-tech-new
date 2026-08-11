// src/lib/api/hero.ts
import api from './axios';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  image_url?: string;
  buttonText?: string;
  button_text?: string;
  buttonLink?: string;
  button_link?: string;
  color?: string;
  order: number;
  isActive: boolean;
  is_active?: boolean;
  heroTagline?: string;
  createdAt?: string;
  updatedAt?: string;
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
      image: item.image_url || item.image || '',
      image_url: item.image_url || item.image || '',
      buttonText: item.button_text || item.buttonText,
      button_text: item.button_text || item.buttonText,
      buttonLink: item.button_link || item.buttonLink,
      button_link: item.button_link || item.buttonLink,
      color: item.color,
      order: item.order || 0,
      isActive: item.is_active !== undefined ? item.is_active : item.isActive,
      is_active: item.is_active !== undefined ? item.is_active : item.isActive,
      heroTagline: item.heroTagline,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt,
      created_at: item.created_at || item.createdAt,
      updated_at: item.updated_at || item.updatedAt,
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
      image: item.image_url || item.image || '',
      image_url: item.image_url || item.image || '',
      buttonText: item.button_text || item.buttonText,
      button_text: item.button_text || item.buttonText,
      buttonLink: item.button_link || item.buttonLink,
      button_link: item.button_link || item.buttonLink,
      color: item.color,
      order: item.order || 0,
      isActive: item.is_active !== undefined ? item.is_active : item.isActive,
      is_active: item.is_active !== undefined ? item.is_active : item.isActive,
      heroTagline: item.heroTagline,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt,
      created_at: item.created_at || item.createdAt,
      updated_at: item.updated_at || item.updatedAt,
    };
  },

  create: async (data: Partial<HeroSlide>): Promise<HeroSlide> => {
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      image_url: data.image || data.image_url,
      button_text: data.buttonText || data.button_text,
      button_link: data.buttonLink || data.button_link,
      order: data.order || 0,
      is_active: data.isActive !== undefined ? data.isActive : data.is_active,
    };
    const response = await api.post("/hero", payload);
    const item = response.data?.data || response.data;
    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      image: item.image_url || item.image || '',
      image_url: item.image_url || item.image || '',
      buttonText: item.button_text || item.buttonText,
      button_text: item.button_text || item.buttonText,
      buttonLink: item.button_link || item.buttonLink,
      button_link: item.button_link || item.buttonLink,
      color: item.color,
      order: item.order || 0,
      isActive: item.is_active !== undefined ? item.is_active : item.isActive,
      is_active: item.is_active !== undefined ? item.is_active : item.isActive,
      heroTagline: item.heroTagline,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt,
      created_at: item.created_at || item.createdAt,
      updated_at: item.updated_at || item.updatedAt,
    };
  },

  update: async (id: string, data: Partial<HeroSlide>): Promise<HeroSlide> => {
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      image_url: data.image || data.image_url,
      button_text: data.buttonText || data.button_text,
      button_link: data.buttonLink || data.button_link,
      order: data.order,
      is_active: data.isActive !== undefined ? data.isActive : data.is_active,
    };
    const response = await api.put(`/hero/${id}`, payload);
    const item = response.data?.data || response.data;
    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      image: item.image_url || item.image || '',
      image_url: item.image_url || item.image || '',
      buttonText: item.button_text || item.buttonText,
      button_text: item.button_text || item.buttonText,
      buttonLink: item.button_link || item.buttonLink,
      button_link: item.button_link || item.buttonLink,
      color: item.color,
      order: item.order || 0,
      isActive: item.is_active !== undefined ? item.is_active : item.isActive,
      is_active: item.is_active !== undefined ? item.is_active : item.isActive,
      heroTagline: item.heroTagline,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt,
      created_at: item.created_at || item.createdAt,
      updated_at: item.updated_at || item.updatedAt,
    };
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/hero/${id}`);
  },

  reorder: async (items: { id: string; order: number }[]): Promise<void> => {
    await api.put("/hero/reorder", { items });
  },
};
