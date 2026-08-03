// src/lib/api/settings.ts
import { apiClient } from "./client";

// 🔥 مقادیر پیش‌فرض
export const defaultSettings = {
  siteName: "Supreme Tech",
  siteDescription: "پیشرو در توسعه AI Agent های هوشمند",
  contactEmail: "info@supremetech.ir",
  contactPhone: "09121234567",
  contactAddress: "تهران، بزرگراه اشرفی اصفهانی، مجتمع نیایش",
  contactMapLink: "https://maps.app.goo.gl/3JnB1ePWY57CiHkf6",
  workingHours: "شنبه تا چهارشنبه ۹ الی ۱۸",
  socialLinks: {
    instagram: "",
    twitter: "",
    linkedin: "",
    telegram: "",
  },
  seo: {
    title: "",
    description: "",
    keywords: "",
  },
  maintenance: false,
};

// src/lib/api/settings.ts
export const settingsAPI = {
  getAll: async () => {
    try {
      // 🔥 ابتدا از مسیر عمومی دریافت کن
      const response = await apiClient.get("/settings/public");
      return response;
    } catch (error: any) {
      // اگر مسیر public نبود، از مسیر اصلی استفاده کن
      try {
        const response = await apiClient.get("/settings");
        return response;
      } catch (error) {
        console.warn("⚠️ خطا در دریافت تنظیمات، استفاده از مقادیر پیش‌فرض");
        return defaultSettings;
      }
    }
  },

  update: async (data: any) => {
    const response = await apiClient.put("/settings", data);
    return response;
  },
};
