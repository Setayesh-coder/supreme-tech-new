import api from './axios';

export const partnersAPI = {
  getActive: async () => {
    const response = await api.get("/partners?isActive=true");
    return response.data;
  },

  getAll: async () => {
    const response = await api.get("/partners");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/partners/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/partners", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.put(`/partners/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.delete(`/partners/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};
