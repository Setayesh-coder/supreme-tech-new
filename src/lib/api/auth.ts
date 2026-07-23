// src/lib/api/auth.ts
import { apiClient } from "./client";

// ========== تایپ‌ها ==========
interface RegisterUserData {
  phone: string;
  name: string;
  password?: string;
}

interface LoginUserData {
  phone: string;
  password?: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  password?: string;
}

export const authAPI = {
  // ========== ادمین ==========
  registerAdmin: (data: { phone: string; password: string; name: string }) => {
    return apiClient.post("/admin/register", data);
  },

  loginAdmin: (data: { phone: string; password: string }) => {
    return apiClient.post("/admin/login", data);
  },

  // ========== کاربر عادی ==========
  registerUser: async (data: RegisterUserData) => {
    const response = await apiClient.post("/users/register", data);
    return response;
  },

  loginUser: async (data: LoginUserData) => {
    const response = await apiClient.post("/users/login", data);
    return response;
  },

  // ========== پروفایل ==========
  getProfile: async () => {
    const token = localStorage.getItem("token") || undefined;
    const response = await apiClient.get("/users/profile", token);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const token = localStorage.getItem("token") || undefined;
    const response = await apiClient.put("/users/profile", data, token);
    return response.data;
  },

  // ========== توکن ==========
  saveToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  changePassword: async (data: { current: string; new: string }) => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      "/admin/change-password",
      data,
      token,
    );
    return response;
  },
};
