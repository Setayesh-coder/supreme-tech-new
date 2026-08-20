import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../lib/api/axios";

export interface SettingsData {
  site_title?: string;
  siteName?: string;
  siteDescription?: string;
  site_description?: string;
  siteLogo?: string;
  logo_url?: string;
  contactEmail?: string;
  contact_email?: string;
  contactPhone?: string;
  contact_phone?: string;
  contactAddress?: string;
  address?: string;
  contactMapLink?: string;
  workingHours?: string;
  telegram_url?: string;
  telegram_support_url?: string;
  instagram_url?: string;
  address_link?: string;
  // socialLinks?: {
  //   instagram?: string;
  //   telegram?: string;
  //   support?: string;
  // };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  maintenance?: boolean;
  maintenance_mode?: boolean;
  [key: string]: any;
}

interface SettingsContextType {
  settings: SettingsData;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SettingsData>) => Promise<void>;
  setSettings: (settings: SettingsData) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const defaultSettings: SettingsData = {
  siteName: "Supreme Tech",
  site_title: "Supreme Tech",
  siteDescription: "پیشرو در توسعه AI Agent های هوشمند",
  site_description: "پیشرو در توسعه AI Agent های هوشمند",
  contactEmail: "info@supremetech.ir",
  contact_email: "info@supremetech.ir",
  contactPhone: "09121234567",
  contact_phone: "09121234567",
  contactAddress: "تهران، بزرگراه اشرفی اصفهانی، مجتمع نیایش",
  address: "تهران، بزرگراه اشرفی اصفهانی، مجتمع نیایش",
  contactMapLink: "https://maps.app.goo.gl/3JnB1ePWY57CiHkf6",
  workingHours: "شنبه تا چهارشنبه ۹ الی ۱۸",
  telegram_url: "",
  telegram_support_url: "",
  instagram_url: "",
  address_link: "",
  // socialLinks: {
  //   instagram: "",
  //   telegram: "",
  //   support: "",
  // },
  seo: {
    title: "",
    description: "",
    keywords: "",
  },
  maintenance: false,
  maintenance_mode: false,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettingsState] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // console.log("🔄 شروع دریافت تنظیمات...");

      const response = await api.get("/settings/public");
      const data = response.data;
      // console.log("📦 داده‌های دریافت شده از API:", data);

      if (data) {
        const newSettings = {
          ...defaultSettings,
          ...data,
          siteName:
            data.site_title || data.siteName || defaultSettings.siteName,
          site_title:
            data.site_title || data.siteName || defaultSettings.site_title,
          siteDescription:
            data.site_description ||
            data.siteDescription ||
            defaultSettings.siteDescription,
          site_description:
            data.site_description ||
            data.siteDescription ||
            defaultSettings.site_description,
          contactEmail:
            data.contact_email ||
            data.contactEmail ||
            defaultSettings.contactEmail,
          contact_email:
            data.contact_email ||
            data.contactEmail ||
            defaultSettings.contact_email,
          contactPhone:
            data.contact_phone ||
            data.contactPhone ||
            defaultSettings.contactPhone,
          contact_phone:
            data.contact_phone ||
            data.contactPhone ||
            defaultSettings.contact_phone,
          contactAddress:
            data.address ||
            data.contactAddress ||
            defaultSettings.contactAddress,
          address:
            data.address_link ||
            data.contactAddress ||
            defaultSettings.address_link,

          maintenance:
            data.maintenance_mode !== undefined
              ? data.maintenance_mode
              : data.maintenance,
          maintenance_mode:
            data.maintenance_mode !== undefined
              ? data.maintenance_mode
              : data.maintenance,

          // socialLinks: {
          //   ...defaultSettings.socialLinks,
          //   ...(data.socialLinks || {}),
          // },
          seo: {
            ...defaultSettings.seo,
            ...(data.seo || {}),
          },
        };
        // console.log("📦 تنظیمات نهایی:", newSettings);
        setSettingsState(newSettings);
      }
      setError(null);
    } catch (err) {
      console.error("❌ خطا در دریافت تنظیمات:", err);
      setError("خطا در دریافت تنظیمات");
    } finally {
      setLoading(false);
      // console.log("✅ دریافت تنظیمات تمام شد");
    }
  };

  const updateSettings = async (newSettings: Partial<SettingsData>) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("برای تغییر تنظیمات باید وارد شوید");
      }

      // console.log("🔄 بروزرسانی تنظیمات:", newSettings);

      const payload: any = {};
      if (newSettings.siteName !== undefined) {
        payload.site_title = newSettings.siteName;
        payload.siteName = newSettings.siteName;
      }
      if (newSettings.site_title !== undefined) {
        payload.site_title = newSettings.site_title;
        payload.siteName = newSettings.site_title;
      }

      if (newSettings.siteDescription !== undefined) {
        payload.site_description = newSettings.siteDescription;
        payload.siteDescription = newSettings.siteDescription;
      }
      if (newSettings.site_description !== undefined) {
        payload.site_description = newSettings.site_description;
        payload.siteDescription = newSettings.site_description;
      }

      if (newSettings.contactEmail !== undefined) {
        payload.contact_email = newSettings.contactEmail;
        payload.contactEmail = newSettings.contactEmail;
      }
      if (newSettings.contact_email !== undefined) {
        payload.contact_email = newSettings.contact_email;
        payload.contactEmail = newSettings.contact_email;
      }

      if (newSettings.contactPhone !== undefined) {
        payload.contact_phone = newSettings.contactPhone;
        payload.contactPhone = newSettings.contactPhone;
      }
      if (newSettings.contact_phone !== undefined) {
        payload.contact_phone = newSettings.contact_phone;
        payload.contactPhone = newSettings.contact_phone;
      }

      if (newSettings.contactAddress !== undefined) {
        payload.address = newSettings.contactAddress;
        payload.contactAddress = newSettings.contactAddress;
      }
      if (newSettings.address !== undefined) {
        payload.address = newSettings.address;
        payload.contactAddress = newSettings.address;
      }

      if (newSettings.maintenance !== undefined) {
        payload.maintenance_mode = newSettings.maintenance;
        payload.maintenance = newSettings.maintenance;
      }
      if (newSettings.maintenance_mode !== undefined) {
        payload.maintenance_mode = newSettings.maintenance_mode;
        payload.maintenance = newSettings.maintenance_mode;
      }
      if (newSettings.instagram_url)
        payload.instagram_url = newSettings.instagram_url;
      if (newSettings.telegram_url_url)
        payload.telegram_url = newSettings.telegram_url;
      if (newSettings.telegram_url)
        payload.telegram_url = newSettings.telegram_url;
      if (newSettings.telegram_support_url)
        payload.telegram_support_url = newSettings.telegram_support_url;
      // if (newSettings.socialLinks)
      //   payload.socialLinks = newSettings.socialLinks;
      if (newSettings.seo) payload.seo = newSettings.seo;

      //  console.log("📤 payload ارسال به سرور:", payload);

      // const response = await api.put("/settings/", payload, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // console.log("📥 پاسخ سرور:", response.data);

      await fetchSettings();

      // console.log("✅ تنظیمات با موفقیت به‌روزرسانی شد");
    } catch (err) {
      console.error("❌ خطا در بروزرسانی تنظیمات:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refreshSettings: fetchSettings,
        updateSettings,
        setSettings: setSettingsState,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
