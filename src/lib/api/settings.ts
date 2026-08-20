// src/lib/api/settings.ts
import api from "./axios";

export const settingsAPI = {
  getPublic: async () => {
    const response = await api.get("/settings/public");
    return response.data;
  },

  getAll: async () => {
    const token = localStorage.getItem("token") || "";
    // ✅ استفاده از /settings/ با خط تیره در انتها
    const response = await api.get("/settings/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    // console.log("📤 بروزرسانی تنظیمات:", data);

    // ✅ فقط فیلدهایی که بک‌اند قبول می‌کند
    const payload: any = {};
    if (data.site_title) payload.site_title = data.site_title;
    if (data.siteName) payload.site_title = data.siteName;
    if (data.site_description) payload.site_description = data.site_description;
    if (data.siteDescription) payload.site_description = data.siteDescription;
    if (data.contact_email) payload.contact_email = data.contact_email;
    if (data.contactEmail) payload.contact_email = data.contactEmail;
    if (data.contact_phone) payload.contact_phone = data.contact_phone;
    if (data.contactPhone) payload.contact_phone = data.contactPhone;
    if (data.address_link) payload.address_link = data.address_link;
    if (data.contactAddress) payload.address = data.contactAddress;
    if (data.telegram_url) payload.telegram_url = data.telegram_url;
    if (data.instagram_url) payload.instagram_url = data.instagram_url;
    if (data.telegram_support_url)
      payload.telegram_support_url = data.telegram_support_url;
    if (data.seo) payload.seo = data.seo;
    if (data.maintenance !== undefined)
      payload.maintenance_mode = data.maintenance;
    if (data.maintenance_mode !== undefined)
      payload.maintenance_mode = data.maintenance_mode;

    // console.log("📤 payload نهایی:", payload);

    // ✅ استفاده از /settings/ با خط تیره در انتها
    const response = await api.put("/settings/", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // console.log("📥 پاسخ سرور:", response.data);
    return response.data;
  },

  reset: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(
      "/settings/reset",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};
