// src/lib/api/auth.ts
import api from './axios';

export const authAPI = {
  registerAdmin: (data: { phone: string; password: string; name: string }) => {
    return api.post("/admin/register", data);
  },

  loginAdmin: (data: { phone: string; password: string }) => {
    return api.post("/admin/login", data);
  },

  registerUser: async (data: { phone: string; name: string; password?: string; email?: string }) => {
    const response = await api.post("/users/register", data);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  loginUser: async (data: { phone: string; password?: string }) => {
    const response = await api.post("/users/login", data);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("employee");
  },

  changePassword: async (data: { current: string; new: string }) => {
    const response = await api.patch("/admin/change-password", data);
    return response.data;
  },
};
