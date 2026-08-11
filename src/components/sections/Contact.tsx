import { useState } from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { Mail, Phone, MapPin, Send, Copy, MessageCircle } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { messagesAPI } from "../../lib/api/messages";

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
    projectType: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} با موفقیت کپی شد!`);
    } catch (err) {
      alert("خطا در کپی کردن");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await messagesAPI.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.projectType || "درخواست همکاری",
        message: formData.description,
      });

      setSuccess("✅ پیام شما با موفقیت ارسال شد!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        projectType: "",
        description: "",
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.error || "خطا در ارسال پیام");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-center">
            {error}
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
            <h3 className="text-2xl font-bold text-white mb-16 text-center">
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
                    placeholder="نام و نام خانوادگی"
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
                    placeholder="ایمیل"
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
                    placeholder="شماره تماس"
                    dir="rtl"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <input
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    type="text"
                    placeholder="نوع پروژه"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="توضیحات پروژه"
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

            {/* 🔥 اینستاگرام */}
            {settings?.socialLinks?.instagram && (
              <a
                href={settings.socialLinks.instagram}
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
                      <h4 className="font-semibold text-white text-sm">اینستاگرام</h4>
                      <p className="text-gray-400 text-xs">
                        {loading
                          ? "..."
                          : settings?.socialLinks?.instagram || "@supremetech"}
                      </p>
                    </div>
                    <Send className="w-4 h-4 text-gray-500 group-hover:text-pink-400 transition rotate-45" />
                  </div>
                </LiquidGlassCard>
              </a>
            )}

            {/* 🔥 کانال تلگرام */}
            {settings?.socialLinks?.telegram && (
              <a
                href={settings.socialLinks.telegram}
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
                      <h4 className="font-semibold text-white text-sm">کانال تلگرام</h4>
                      <p className="text-gray-400 text-xs">
                        {loading
                          ? "..."
                          : settings?.socialLinks?.telegram || "@SupremeTech_co"}
                      </p>
                    </div>
                    <Send className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition rotate-45" />
                  </div>
                </LiquidGlassCard>
              </a>
            )}

            {/* 🔥 تلگرام پشتیبانی */}
            {settings?.socialLinks?.support && (
              <a
                href={settings.socialLinks.support}
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
                      <h4 className="font-semibold text-white text-sm">پشتیبانی تلگرام</h4>
                      <p className="text-gray-400 text-xs">
                        {loading
                          ? "..."
                          : settings?.socialLinks?.support || "@SupremeTech_support"}
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
                settings?.contactMapLink ||
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
