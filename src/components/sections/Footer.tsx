import { Link } from "react-router-dom";
import { Brain, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
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
        
        {/* Grid ریسپانسیو - 2 ستون در موبایل */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-4 md:mb-8">
          
          {/* Brand Section - ستون 1 */}
          <div className="text-center">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 justify-center">
              <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold bg-gradient-to-l from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Supreme Tech
                </h3>
                <p className="text-[8px] md:text-xs text-gray-500">AI Agent Solutions</p>
              </div>
            </div>
            <p className="text-[9px] md:text-sm text-gray-500 leading-relaxed hidden md:block">
              پیشرو در توسعه AI Agent های هوشمند
            </p>
          </div>

          {/* Quick Links - ستون 2 */}
          <div className="text-center">
            <h4 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-base">دسترسی سریع</h4>
            <div className="space-y-1 md:space-y-2">
              <Link to="/" className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition">
                خانه
              </Link>
              <Link to="/services" className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition">
                خدمات
              </Link>
              <Link to="/about" className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition">
                درباره ما
              </Link>
              <Link to="/approach" className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition">
                رویکرد ما
              </Link>
              <Link to="/contact" className="block text-[9px] md:text-sm text-gray-500 hover:text-blue-400 transition">
                تماس با ما
              </Link>
            </div>
          </div>

          {/* Services - ستون 1 ردیف دوم */}
          <div className="text-center">
            <h4 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-base">خدمات</h4>
            <div className="space-y-1 md:space-y-2">
              <p className="text-[9px] md:text-sm text-gray-500">AI Agent های بهینه‌ساز</p>
              <p className="text-[9px] md:text-sm text-gray-500">AI Agent های خلاق</p>
              <p className="text-[9px] md:text-sm text-gray-500">AI Agent های تحلیلی</p>
              <p className="text-[9px] md:text-sm text-gray-500">مشاوره AI</p>
            </div>
          </div>

          {/* Contact Info - ستون 2 ردیف دوم */}
          <div className="text-center">
            <h4 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-base">تماس با ما</h4>
            <div className="space-y-1.5 md:space-y-3">
              <div
                className="flex items-center gap-1.5 md:gap-2 group cursor-pointer justify-center"
                onClick={() => copyToClipboard("supremetech.ir@gmail.com", "ایمیل")}
              >
                <Mail className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-400 group-hover:scale-110 transition shrink-0" />
                <span className="text-[8px] md:text-sm text-gray-500 group-hover:text-cyan-400 break-all">
                  ایمیل
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 md:gap-2 group cursor-pointer justify-center"
                onClick={() => copyToClipboard("09199017041", "شماره تلفن")}
              >
                <Phone className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-400 group-hover:scale-110 transition shrink-0" />
                <span className="text-[8px] md:text-sm text-gray-500 group-hover:text-cyan-400">
                  تلفن
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 md:gap-2 group cursor-pointer justify-center"
                onClick={() =>
                  window.open(
                    "https://maps.google.com/?cid=590621477498261219",
                    "_blank"
                  )
                }
              >
                <MapPin className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-400 group-hover:scale-110 transition shrink-0" />
                <span className="text-[8px] md:text-sm text-gray-500 group-hover:text-cyan-400">
                  آدرس
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* متن برند در موبایل - فقط در موبایل نمایش داده بشه */}
        <p className="text-[9px] text-gray-500 leading-relaxed text-center mt-2 md:hidden">
          پیشرو در توسعه AI Agent های هوشمند
        </p>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-4 md:pt-8 text-center space-y-1.5 md:space-y-3 mt-2">
          <p className="text-[8px] md:text-sm text-gray-500">
            تمام حقوق برای مرکز توسعه فناوری‌های برتر تهران محفوظ است.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-1 md:py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <span className="text-[8px] md:text-xs text-gray-400">Supreme Tech 1405</span>
          </Link>
          <p className="text-[7px] md:text-xs text-gray-500">
            ساخته شده با <span className="text-blue-400">♥️</span> و قدرت{" "}
            <span className="bg-gradient-to-l from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              هوش مصنوعی
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
