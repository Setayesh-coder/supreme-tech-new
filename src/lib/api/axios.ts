// src/lib/api/axios.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://supremetech.ir/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// 🔥 اینترسپتور برای اضافه کردن توکن به هدر
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log(
      "🔑 توکن در localStorage:",
      token ? "✅ وجود دارد" : "❌ وجود ندارد",
    );
    console.log("📤 درخواست به:", config.method?.toUpperCase(), config.url);

    if (token) {
      // 🔥 اینجا توکن رو به هدر اضافه میکنیم
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 توکن به هدر اضافه شد");
    } else {
      console.warn("⚠️ توکن وجود ندارد!");
    }

    console.log("📤 هدر نهایی:", config.headers);
    return config;
  },
  (error) => {
    console.error("❌ خطا در درخواست:", error);
    return Promise.reject(error);
  },
);

// 🔥 اینترسپتور برای پاسخ‌ها
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ خطا:", error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      console.error("❌ خطای 401 - توکن نامعتبر یا منقضی شده");
      // توکن رو پاک کنید و به لاگین ببرید
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      // فقط اگه در صفحه لاگین نیستید
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
