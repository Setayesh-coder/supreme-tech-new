// src/lib/api/team.ts
import api from './axios';

export const teamAPI = {
  getAll: async () => {
    const response = await api.get("/team");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/team/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/team", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.put(`/team/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.delete(`/team/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};
