// src/lib/api/auth.ts
import api from "./axios";

export const authAPI = {
  // ========== ادمین ==========
  registerAdmin: (data: { phone: string; password: string; name: string }) => {
    return api.post("/admin/register", data);
  },

  loginAdmin: (data: { phone: string; password: string }) => {
    return api.post("/admin/login", data);
  },

  // ========== کاربر عادی ==========
  registerUser: async (data: {
    phone: string;
    name: string;
    password?: string;
    email?: string;
  }) => {
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

  // ========== پروفایل ==========
  getProfile: async () => {
    const response = await api.get("/users/me");
    console.log("📥 پروفایل دریافت شده از API:", response.data);
    return response.data;
  },

  // ✅ اصلاح: نام فیلدها با بک‌اند هماهنگ
  updateProfile: async (data: any) => {
    // فیلدهای مجاز برای بروزرسانی با نام‌های بک‌اند
    const allowedFields = [
      "name",
      "email",
      "phone",
      "province",
      "birthDate",
      "gender",
      "avatar",
    ];
    const filteredData: any = {};

    for (const key of allowedFields) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
        filteredData[key] = data[key];
      }
    }

    console.log("📤 ارسال به سرور:", filteredData);

    // اگر داده‌ای برای ارسال وجود نداشت
    if (Object.keys(filteredData).length === 0) {
      return { message: "هیچ تغییری اعمال نشد" };
    }

    const response = await api.patch("/users/me", filteredData);
    return response.data;
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    const response = await api.post("/users/me/change-password", data);
    return response.data;
  },

  // ========== توکن و کاربر ==========
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
};
