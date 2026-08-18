import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send, MessageCircle, Heart } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";

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
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function Footer() {
  const { settings, loading } = useSettings();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} با موفقیت کپی شد!`);
    } catch (err) {
      alert("خطا در کپی کردن");
    }
  };

  return (
    <footer className="py-6 px-3 md:py-12 md:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-4 md:mb-8">
          {/* بخش برند - لوگو */}
          <div className="text-center">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 justify-center">
              <img
                src="/favicon/favicon-96x96.png"
                alt="supreme tech"
                className="w-12 h-12"
                onError={(e) => {
                  console.error(" خطا در لود لوگو:", e);
                  (e.target as HTMLImageElement).src = "/favicon.ico";
                }}
              />
              <div>
                <h3 className="text-sm md:text-xl font-bold bg-gradient-to-l from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {loading ? "..." : settings?.site_title || "Supreme Tech"}
                </h3>
                <p className="text-[8px] md:text-xs text-gray-500">
                  AI Agent Solutions
                </p>
              </div>
            </div>
            <p className="text-[9px] md:text-sm text-gray-500 leading-relaxed hidden md:block">
              {loading
                ? "..."
                : settings?.site_description ||
                  "پیشرو در توسعه AI Agent های هوشمند"}
            </p>
          </div>

          {/* دسترسی سریع */}
          <div className="text-center">
            <h4 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-base">
              دسترسی سریع
            </h4>
            <div className="space-y-1 md:space-y-2">
              <Link
                to="/"
                className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition"
              >
                خانه
              </Link>
              <Link
                to="/services"
                className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition"
              >
                خدمات
              </Link>
              <Link
                to="/about"
                className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition"
              >
                درباره ما
              </Link>
              <Link
                to="/approach"
                className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition"
              >
                رویکرد ما
              </Link>
              <Link
                to="/contact"
                className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition"
              >
                تماس با ما
              </Link>
            </div>
          </div>

          {/* خدمات */}
          <div className="text-center">
            <h4 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-base">
              خدمات
            </h4>
            <div className="space-y-1 md:space-y-2">
              <p className="text-[9px] md:text-sm text-gray-500">
                AI Agents سفارشی
              </p>
              <p className="text-[9px] md:text-sm text-gray-500">
                هوش مصنوعی پیشرفته
              </p>
              <p className="text-[9px] md:text-sm text-gray-500">
                توسعه نرم‌افزار
              </p>
              <p className="text-[9px] md:text-sm text-gray-500">
                زیرساخت ابری
              </p>
              <p className="text-[9px] md:text-sm text-gray-500">
                دوره‌های آموزشی
              </p>
              <p className="text-[9px] md:text-sm text-gray-500">
                مشاوره تخصصی
              </p>
            </div>
          </div>

          {/* تماس با ما + شبکه‌های اجتماعی */}
          <div className="text-center">
            <h4 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-base">
              تماس با ما
            </h4>
            <div className="space-y-1.5 md:space-y-3">
              <div
                className="flex items-center gap-1.5 md:gap-2 group cursor-pointer justify-center"
                onClick={() =>
                  copyToClipboard(
                    settings?.contact_email || "info@supremetech.ir",
                    "ایمیل",
                  )
                }
              >
                <Mail className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-400 group-hover:scale-110 transition shrink-0" />
                <span className="text-[8px] md:text-sm text-gray-500 group-hover:text-cyan-400 break-all">
                  {loading
                    ? "..."
                    : settings?.contact_email || "info@supremetech.ir"}
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 md:gap-2 group cursor-pointer justify-center"
                onClick={() =>
                  copyToClipboard(
                    settings?.contactPhone || "09121234567",
                    "شماره تلفن",
                  )
                }
              >
                <Phone className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-400 group-hover:scale-110 transition shrink-0" />
                <span className="text-[8px] md:text-sm text-gray-500 group-hover:text-cyan-400">
                  {loading ? "..." : settings?.contact_phone || "09121234567"}
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 md:gap-2 group cursor-pointer justify-center"
                onClick={() =>
                  window.open(
                    "https://maps.google.com/?q=" +
                      encodeURIComponent(settings?.address || "تهران"),
                    "_blank",
                  )
                }
              >
                <MapPin className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-400 group-hover:scale-110 transition shrink-0" />
                <span className="text-[8px] md:text-sm text-gray-500 group-hover:text-cyan-400">
                  آدرس
                </span>
              </div>

              {/* شبکه‌های اجتماعی */}
              <div className="flex justify-center gap-3 pt-2">
                {settings?.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-pink-500 transition-colors"
                    aria-label="اینستاگرام"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {settings?.telegram_url && (
                  <a
                    href={settings.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-400 transition-colors"
                    aria-label="کانال تلگرام"
                  >
                    <Send size={18} />
                  </a>
                )}
                {settings?.telegram_support_url && (
                  <a
                    href={settings.telegram_support_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-cyan-400 transition-colors"
                    aria-label="پشتیبانی تلگرام"
                  >
                    <MessageCircle size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-[9px] text-gray-500 leading-relaxed text-center mt-2 md:hidden">
          {loading
            ? "..."
            : settings?.site_description ||
              "پیشرو در توسعه AI Agent های هوشمند"}
        </p>

        <div className="border-t border-white/10 pt-4 md:pt-8 text-center space-y-1.5 md:space-y-3 mt-2">
          <p className="text-[8px] md:text-sm text-gray-500">
            تمام حقوق برای مرکز توسعه فناوری‌های برتر تهران محفوظ است.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-1 md:py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <span className="text-[8px] md:text-xs text-gray-400">
              Supreme Tech 1405
            </span>
          </Link>
          <p className="text-[7px] md:text-xs text-gray-500">
            ساخته شده با{" "}
            <span className="text-blue-400">
              <Heart />
            </span>{" "}
            و قدرت{" "}
            <span className="bg-gradient-to-l from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              هوش مصنوعی
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
