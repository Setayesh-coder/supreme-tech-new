// src/pages/Contact.tsx
import { useState } from "react";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { Mail, Phone, MapPin, Send, Copy, MessageCircle } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { messagesAPI } from "../../lib/api/messages";
import { toast } from "../../hooks/use-toast";

// آیکون اینستاگرام با SVG
const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
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

export default function Contact() {
  const { settings, loading } = useSettings();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    project_type: "",
    project_description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} با موفقیت کپی شد!`);
    } catch (err) {
      toast.error("خطا در کپی کردن");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // ✅ ارسال با فیلدهای جدید
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        project_type: formData.project_type.trim() || "درخواست همکاری",
        project_description: formData.project_description.trim(),
      };

      console.log("📤 ارسال داده به سرور:", payload);

      await messagesAPI.create(payload);

      setSuccess("✅ پیام شما با موفقیت ارسال شد!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        project_type: "",
        project_description: "",
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ خطا:", err);

      let errorMessage = "خطا در ارسال پیام";

      if (err.response) {
        console.log("📥 پاسخ سرور:", {
          status: err.response.status,
          data: err.response.data,
        });

        if (err.response.status === 422) {
          const detail = err.response.data?.detail;

          if (Array.isArray(detail)) {
            const errorMessages = detail.map((d: any) => {
              const field = d.loc?.[1] || d.loc?.[0] || "فیلد";
              const fieldNames: Record<string, string> = {
                name: "نام",
                email: "ایمیل",
                phone: "شماره تماس",
                project_type: "نوع پروژه",
                project_description: "توضیحات پروژه",
              };
              const persianField = fieldNames[field] || field;
              return `${persianField}: ${d.msg}`;
            });
            errorMessage = errorMessages.join(" • ");
          } else if (typeof detail === "string") {
            errorMessage = detail;
          } else {
            errorMessage =
              "داده‌های وارد شده معتبر نیستند. لطفاً همه فیلدها را بررسی کنید.";
          }
        } else {
          errorMessage =
            err.response.data?.detail ||
            err.response.data?.message ||
            err.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(`❌ ${errorMessage}`);
      setTimeout(() => setError(""), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-24 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="100px"
              glowIntensity="sm"
              className="inline-flex px-4 py-2 mb-6"
            >
              <div className="inline-flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">
                  تماس با ما
                </span>
              </div>
            </LiquidGlassCard>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-l from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              آماده شروع همکاری هستید؟
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            آماده‌اید تا کسب‌وکارتان را با قدرت AI Agent ها متحول کنید؟ همین
            امروز با تیم Supreme Tech در ارتباط باشید و مشاوره رایگان دریافت
            کنید.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-4 text-center">
            <div className="text-sm leading-relaxed">{error}</div>
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 text-center">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* فرم تماس */}
          <LiquidGlassCard
            blurIntensity="lg"
            borderRadius="32px"
            glowIntensity="md"
            className="p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              فرم تماس سریع
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="نام و نام خانوادگی *"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="ایمیل *"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="شماره تماس *"
                    dir="rtl"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <input
                    name="project_type"
                    value={formData.project_type}
                    onChange={handleChange}
                    type="text"
                    placeholder="نوع پروژه *"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <textarea
                  name="project_description"
                  value={formData.project_description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="توضیحات پروژه *"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <GlassButton
                type="submit"
                fullWidth
                variant="primary"
                size="lg"
                loading={isSubmitting}
                icon={<Send className="w-4 h-4" />}
                iconPosition="left"
              >
                {isSubmitting ? "در حال ارسال..." : "ارسال درخواست"}
              </GlassButton>
            </form>
          </LiquidGlassCard>

          {/* اطلاعات تماس + شبکه‌های اجتماعی */}
          <div className="space-y-6">
            {/* ایمیل */}
            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="24px"
              glowIntensity="sm"
              className="p-4 group cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() =>
                copyToClipboard(
                  settings?.contact_email || "info@supremetech.ir",
                  "ایمیل",
                )
              }
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">ایمیل</h4>
                  <p className="text-gray-400 text-xs">
                    {loading
                      ? "..."
                      : settings?.contact_email || "info@supremetech.ir"}
                  </p>
                </div>
                <Copy className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition" />
              </div>
            </LiquidGlassCard>

            {/* تلفن */}
            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="24px"
              glowIntensity="sm"
              className="p-4 group cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() =>
                copyToClipboard(
                  settings?.contact_phone || "09121234567",
                  "شماره تلفن",
                )
              }
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                  <Phone className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">تلفن</h4>
                  <p className="text-gray-400 text-xs">
                    {loading ? "..." : settings?.contact_phone || "09121234567"}
                  </p>
                </div>
                <Copy className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition" />
              </div>
            </LiquidGlassCard>

            {/* اینستاگرام */}
            {settings?.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <LiquidGlassCard
                  blurIntensity="lg"
                  borderRadius="24px"
                  glowIntensity="sm"
                  className="p-4 group hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                      <InstagramIcon />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">
                        اینستاگرام
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {settings.instagram_url
                          .replace(/^https?:\/\/(www\.)?/, "")
                          .slice(0, 30)}
                      </p>
                    </div>
                    <Send className="w-4 h-4 text-gray-500 group-hover:text-pink-400 transition rotate-45" />
                  </div>
                </LiquidGlassCard>
              </a>
            )}

            {/* کانال تلگرام */}
            {settings?.telegram_url && (
              <a
                href={settings.telegram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <LiquidGlassCard
                  blurIntensity="lg"
                  borderRadius="24px"
                  glowIntensity="sm"
                  className="p-4 group hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                      <Send className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">
                        کانال تلگرام
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {settings.telegram_url.replace(
                          /^https?:\/\/(t\.me\/)/,
                          "@",
                        )}
                      </p>
                    </div>
                    <Send className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition rotate-45" />
                  </div>
                </LiquidGlassCard>
              </a>
            )}

            {/* پشتیبانی تلگرام */}
            {settings?.telegram_support_url && (
              <a
                href={settings.telegram_support_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <LiquidGlassCard
                  blurIntensity="lg"
                  borderRadius="24px"
                  glowIntensity="sm"
                  className="p-4 group hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                      <MessageCircle className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">
                        پشتیبانی تلگرام
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {settings.telegram_support_url.replace(
                          /^https?:\/\/(t\.me\/)/,
                          "@",
                        )}
                      </p>
                    </div>
                    <Send className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition rotate-45" />
                  </div>
                </LiquidGlassCard>
              </a>
            )}

            {/* آدرس */}
            <a
              href={
                settings?.address_link ||
                "https://maps.app.goo.gl/3JnB1ePWY57CiHkf6"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <LiquidGlassCard
                blurIntensity="lg"
                borderRadius="24px"
                glowIntensity="sm"
                className="p-4 group hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <MapPin className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">آدرس</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {loading
                        ? "..."
                        : settings?.address ||
                          "تهران، بزرگراه اشرفی اصفهانی، بالاتر از میدان پونک، مجتمع نیایش"}
                    </p>
                  </div>
                  <Send className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition rotate-45" />
                </div>
              </LiquidGlassCard>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
