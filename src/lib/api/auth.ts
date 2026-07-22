import { apiClient } from "./client";

export const authAPI = {
  // ثبت نام ادمین
  registerAdmin: (data: {
    phone: string;
    email?: string;
    password: string;
    name: string;
  }) => {
    return apiClient.post("/admin/register", data);
  },

  // لاگین ادمین
  loginAdmin: (data: { phone: string; password: string }) => {
    return apiClient.post("/admin/login", data);
  },

  // ثبت نام کاربر عادی
  registerUser: (data: {
    phone: string;
    email?: string;
    password?: string;
    name: string;
  }) => {
    return apiClient.post("/users/register", data);
  },

  // لاگین کاربر عادی
  loginUser: (data: { phone: string; password?: string }) => {
    return apiClient.post("/users/login", data);
  },

  // ذخیره توکن در localStorage
  saveToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  // دریافت توکن
  getToken: () => {
    return localStorage.getItem("token");
  },

  // حذف توکن (خروج)
  logout: () => {
    localStorage.removeItem("token");
  },
};
