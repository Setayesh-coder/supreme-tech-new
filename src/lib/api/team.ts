import { apiClient } from "./client";

export const teamAPI = {
  getAll: () => {
    return apiClient.get("/team");
  },

  getById: (id: string) => {
    return apiClient.get(`/team/${id}`);
  },

  create: (data: any, token: string) => {
    return apiClient.post("/team", data, token);
  },

  update: (id: string, data: any, token: string) => {
    return apiClient.put(`/team/${id}`, data, token);
  },

  delete: (id: string, token: string) => {
    return apiClient.delete(`/team/${id}`, token);
  },
};
