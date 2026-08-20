import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { useSettings } from "../../../contexts/SettingsContext";
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
  Send,
  MessageCircle,
} from "lucide-react";

// آیکون اینستاگرام با SVG
const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-pink-400"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function Settings() {
  const { settings, loading, updateSettings, refreshSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [localSettings, setLocalSettings] = useState<any>({});

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        site_title: settings.site_title || settings.siteName || "",
        site_description:
          settings.site_description || settings.siteDescription || "",
        contact_email: settings.contact_email || settings.contactEmail || "",
        contact_phone: settings.contact_phone || settings.contactPhone || "",
        address: settings.address || settings.contactAddress || "",
        workingHours: settings.workingHours || "",
        // ✅ شبکه‌های اجتماعی - با نام‌های صحیح
        instagram_url: settings.instagram_url || "",
        telegram_url: settings.telegram_url || "",
        telegram_support_url: settings.telegram_support_url || "",
        address_link: settings.address_link || "",
        seo: {
          title: settings.seo?.title || "",
          description: settings.seo?.description || "",
          keywords: settings.seo?.keywords || "",
        },
        maintenance:
          settings.maintenance !== undefined
            ? settings.maintenance
            : settings.maintenance_mode,
      });
    }
  }, [settings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setLocalSettings((prev: any) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setLocalSettings((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setLocalSettings((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // ✅ تبدیل به فرمت مورد انتظار بک‌اند
      const payload = {
        site_title: localSettings.site_title,
        site_description: localSettings.site_description,
        contact_email: localSettings.contact_email,
        contact_phone: localSettings.contact_phone,
        address_link: localSettings.address_link,
        workingHours: localSettings.workingHours,
        // ✅ نام فیلدهای صحیح
        instagram_url: localSettings.instagram_url || "",
        telegram_url: localSettings.telegram_url || "",
        telegram_support_url: localSettings.telegram_support_url || "",
        seo: localSettings.seo,
        maintenance_mode: localSettings.maintenance || false,
      };

      // console.log("📤 ارسال به سرور:", payload);
      await updateSettings(payload);

      setSuccess("✅ تنظیمات با موفقیت ذخیره شد");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.message || "خطا در ذخیره تنظیمات");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await refreshSettings();
    setSuccess("✅ تنظیمات بازنشانی شد");
    setTimeout(() => setSuccess(""), 2000);
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
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4">
            {success}
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
                  name="site_title"
                  value={localSettings?.site_title || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/60 mb-1">
                  توضیحات سایت
                </label>
                <textarea
                  name="site_description"
                  value={localSettings?.site_description || ""}
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
                    name="contact_email"
                    value={localSettings?.contact_email || ""}
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
                    name="contact_phone"
                    value={localSettings?.contact_phone || ""}
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
                    name="address_link"
                    value={localSettings?.address_link || ""}
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
                    value={localSettings?.workingHours || ""}
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1 flex items-center gap-2">
                  <InstagramIcon />
                  اینستاگرام
                </label>
                <input
                  type="text"
                  name="instagram_url"
                  value={localSettings?.instagram_url || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://instagram.com/yourpage"
                />
                <p className="text-xs text-gray-500 mt-1">
                  لینک صفحه اینستاگرام
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1 flex items-center gap-2">
                  <Send size={18} className="text-blue-400" />
                  کانال تلگرام
                </label>
                <input
                  type="text"
                  name="telegram_url"
                  value={localSettings?.telegram_url || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://t.me/yourchannel"
                />
                <p className="text-xs text-gray-500 mt-1">لینک کانال تلگرام</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1 flex items-center gap-2">
                  <MessageCircle size={18} className="text-cyan-400" />
                  تلگرام پشتیبانی
                </label>
                <input
                  type="text"
                  name="telegram_support_url"
                  value={localSettings?.telegram_support_url || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://t.me/supportbot"
                />
                <p className="text-xs text-gray-500 mt-1">
                  لینک ربات یا اکانت پشتیبانی تلگرام
                </p>
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
                  value={localSettings?.seo?.title || ""}
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
                  value={localSettings?.seo?.description || ""}
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
                  value={localSettings?.seo?.keywords || ""}
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
                    checked={localSettings?.maintenance || false}
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
                  onClick={handleRefresh}
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
