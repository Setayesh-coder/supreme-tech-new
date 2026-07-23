// src/pages/admin/Settings/Settings.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { settingsAPI } from "../../../lib/api/settings";
import {
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Palette,
  Shield,
  Database,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface SettingsData {
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  workingHours: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    telegram?: string;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  maintenance: boolean;
}

export default function Settings() {
  //   const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [settings, setSettings] = useState<SettingsData>({
    siteName: "Supreme Tech",
    siteDescription: "پیشرو در توسعه AI Agent های هوشمند",
    contactEmail: "info@supremetech.ir",
    contactPhone: "09121234567",
    contactAddress: "تهران، بزرگراه اشرفی اصفهانی، مجتمع نیایش",
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
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsAPI.getAll();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error("خطا در دریافت تنظیمات:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setSettings({
        ...settings,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setSettings({
        ...settings,
        [parent]: {
          ...(settings[parent as keyof SettingsData] as any),
          [child]: value,
        },
      });
    } else {
      setSettings({ ...settings, [name]: value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await settingsAPI.update(settings);
      setSuccess("تنظیمات با موفقیت ذخیره شد");
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">⚙️ تنظیمات</h1>
            <p className="text-white/60 text-sm">مدیریت تنظیمات عمومی سایت</p>
          </div>
          <GlassButton
            variant="primary"
            size="md"
            loading={saving}
            icon={<Save size={18} />}
            iconPosition="left"
            onClick={handleSave}
          >
            ذخیره تنظیمات
          </GlassButton>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4">
            ✅ {success}
          </div>
        )}

        <div className="space-y-6">
          {/* تنظیمات عمومی */}
          <LiquidGlassCard
            className="p-6"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="md"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe size={20} className="text-blue-400" />
              تنظیمات عمومی
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/60 mb-1">
                  نام سایت
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/60 mb-1">
                  توضیحات سایت
                </label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          </LiquidGlassCard>

          {/* اطلاعات تماس */}
          <LiquidGlassCard
            className="p-6"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="md"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Phone size={20} className="text-green-400" />
              اطلاعات تماس
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  ایمیل
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  تلفن
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    name="contactPhone"
                    value={settings.contactPhone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/60 mb-1">
                  آدرس
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-white/40" />
                  <textarea
                    name="contactAddress"
                    value={settings.contactAddress}
                    onChange={handleChange}
                    rows={2}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/60 mb-1">
                  ساعت کاری
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    name="workingHours"
                    value={settings.workingHours}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* شبکه‌های اجتماعی */}
          <LiquidGlassCard
            className="p-6"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="md"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Palette size={20} className="text-purple-400" />
              شبکه‌های اجتماعی
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  اینستاگرام
                </label>
                <input
                  type="text"
                  name="socialLinks.instagram"
                  value={settings.socialLinks.instagram || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  توییتر
                </label>
                <input
                  type="text"
                  name="socialLinks.twitter"
                  value={settings.socialLinks.twitter || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  لینکدین
                </label>
                <input
                  type="text"
                  name="socialLinks.linkedin"
                  value={settings.socialLinks.linkedin || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  تلگرام
                </label>
                <input
                  type="text"
                  name="socialLinks.telegram"
                  value={settings.socialLinks.telegram || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://t.me/..."
                />
              </div>
            </div>
          </LiquidGlassCard>

          {/* SEO */}
          <LiquidGlassCard
            className="p-6"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="md"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-yellow-400" />
              تنظیمات SEO
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  عنوان SEO
                </label>
                <input
                  type="text"
                  name="seo.title"
                  value={settings.seo.title || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="عنوان صفحه اصلی"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  توضیحات SEO
                </label>
                <textarea
                  name="seo.description"
                  value={settings.seo.description || ""}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="توضیحات برای موتورهای جستجو"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  کلمات کلیدی
                </label>
                <input
                  type="text"
                  name="seo.keywords"
                  value={settings.seo.keywords || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="واژه‌های کلیدی، جدا شده با کاما"
                />
              </div>
            </div>
          </LiquidGlassCard>

          {/* تنظیمات پیشرفته */}
          <LiquidGlassCard
            className="p-6"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="md"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database size={20} className="text-red-400" />
              تنظیمات پیشرفته
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenance"
                    checked={settings.maintenance}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-500"
                  />
                  حالت نگهداری (Maintenance Mode)
                </label>
              </div>
              <div className="flex gap-3">
                <GlassButton
                  variant="white"
                  size="sm"
                  icon={<RefreshCw size={16} />}
                  iconPosition="left"
                  onClick={fetchSettings}
                >
                  بازنشانی
                </GlassButton>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    </AdminLayout>
  );
}
