// src/lib/api/axios.ts
import axios from "axios";

// 🔥 استفاده از متغیر محیطی
const API_URL = import.meta.env.VITE_API_URL || "https://supremetech.ir/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ فقط توکن رو پاک کن
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      localStorage.removeItem("user");
      localStorage.removeItem("phone");

      console.warn("⚠️ توکن منقضی شده یا نامعتبر، پاک شد");

      // ✅ فقط اگه توکن وجود داشت و کاربر در صفحه لاگین نیست، به لاگین بفرست
      // ❌ این کار رو نکن: window.location.href = "/admin/login";
      // ✅ این کار رو بکن: فقط در صورتی که کاربر در مسیر محافظت‌شده هست
      const isProtectedRoute =
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register") &&
        !window.location.pathname.includes("/forgot-password");

      // ✅ فقط در صورت محافظت‌شده بودن مسیر، به لاگین هدایت کن
      if (isProtectedRoute) {
        // تشخیص مسیر ادمین
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
