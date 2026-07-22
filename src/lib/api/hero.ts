import { apiClient } from "./client";

export const heroAPI = {
  getAll: () => {
    return apiClient.get("/hero");
  },

  getById: (id: string) => {
    return apiClient.get(`/hero/${id}`);
  },

  create: (data: any, token: string) => {
    return apiClient.post("/hero", data, token);
  },

  update: (id: string, data: any, token: string) => {
    return apiClient.put(`/hero/${id}`, data, token);
  },

  delete: (id: string, token: string) => {
    return apiClient.delete(`/hero/${id}`, token);
  },
};
