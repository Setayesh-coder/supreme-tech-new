import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { settingsAPI } from '../lib/api/settings';

export interface SettingsData {
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactMapLink?: string;
  workingHours: string;
  socialLinks: {
    instagram?: string;
    telegram?: string;
    support?: string;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  maintenance: boolean;
}

interface SettingsContextType {
  settings: SettingsData;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SettingsData>) => Promise<void>;
  setSettings: (settings: SettingsData) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: SettingsData = {
  siteName: 'Supreme Tech',
  siteDescription: 'پیشرو در توسعه AI Agent های هوشمند',
  contactEmail: 'info@supremetech.ir',
  contactPhone: '09121234567',
  contactAddress: 'تهران، بزرگراه اشرفی اصفهانی، مجتمع نیایش',
  contactMapLink: 'https://maps.app.goo.gl/3JnB1ePWY57CiHkf6',
  workingHours: 'شنبه تا چهارشنبه ۹ الی ۱۸',
  socialLinks: {
    instagram: '',
    telegram: '',
    support: '',
  },
  seo: {
    title: '',
    description: '',
    keywords: '',
  },
  maintenance: false,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('🔄 شروع دریافت تنظیمات...');
      
      const data = await settingsAPI.getPublic();
      console.log('📦 داده‌های دریافت شده از API:', data);
      
      if (data) {
        const newSettings = {
          ...defaultSettings,
          ...data,
          socialLinks: {
            ...defaultSettings.socialLinks,
            ...(data.socialLinks || {}),
          },
          seo: {
            ...defaultSettings.seo,
            ...(data.seo || {}),
          },
        };
        console.log('📦 تنظیمات نهایی:', newSettings);
        setSettingsState(newSettings);
      }
      setError(null);
    } catch (err) {
      console.error('❌ خطا در دریافت تنظیمات:', err);
      setError('خطا در دریافت تنظیمات');
    } finally {
      setLoading(false);
      console.log('✅ دریافت تنظیمات تمام شد');
    }
  };

  const updateSettings = async (newSettings: Partial<SettingsData>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('برای تغییر تنظیمات باید وارد شوید');
      }
      
      console.log('🔄 بروزرسانی تنظیمات:', newSettings);
      
      await settingsAPI.update({ ...settings, ...newSettings });
      
      setSettingsState(prev => ({
        ...prev,
        ...newSettings,
      }));
      
      console.log('✅ تنظیمات با موفقیت به‌روزرسانی شد');
    } catch (err) {
      console.error('❌ خطا در بروزرسانی تنظیمات:', err);
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
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
