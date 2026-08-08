// src/lib/api/auth.ts
import { apiClient } from "./client";

// ========== تایپ‌ها ==========
interface RegisterUserData {
  phone: string;
  name: string;
  password?: string;
  email?: string;
}

interface LoginUserData {
  phone: string;
  password?: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  email?: string;
  province?: string;
  birthDate?: string;
  gender?: string;
  avatar?: string;
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
    // 🔥 اگر پاسخ شامل توکن بود، ذخیره کن
    if (response && response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  },

  loginUser: async (data: LoginUserData) => {
    const response = await apiClient.post("/users/login", data);
    // 🔥 اگر پاسخ شامل توکن بود، ذخیره کن
    if (response && response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  },

  // ========== پروفایل ==========
  getProfile: async () => {
    const token = localStorage.getItem("token") || undefined;
    const response = await apiClient.get("/users/profile", token);
    return response;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const token = localStorage.getItem("token") || undefined;
    const response = await apiClient.put("/users/profile", data, token);
    return response;
  },

  // ========== توکن ==========
  saveToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  saveUser: (user: any) => {
    localStorage.setItem("user", JSON.stringify(user));
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
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.patch(
      "/admin/change-password",
      data,
      token,
    );
    return response;
  },
};
