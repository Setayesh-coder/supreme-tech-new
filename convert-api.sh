#!/bin/bash

cd /var/www/supreme-tech-frontend/src/lib/api

# تبدیل hero.ts
cat > hero.ts << 'HERO'
import api from './axios';

export const heroAPI = {
  getAll: async () => {
    const response = await api.get("/hero");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/hero/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/hero", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/hero/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/hero/${id}`);
    return response.data;
  },

  reorder: async (items: { id: string; order: number }[]) => {
    const response = await api.put("/hero/reorder", { items });
    return response.data;
  },
};
HERO

echo "✅ hero.ts تبدیل شد"
