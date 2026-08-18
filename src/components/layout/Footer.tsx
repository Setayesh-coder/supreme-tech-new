// src/components/layout/Footer.tsx
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Shield,
  Award,
  CheckCircle,
  Clock,
  Heart,
  Globe,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-white/10">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* شبکه اصلی - ریسپانسیو */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* ستون ۱: درباره */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Supreme Tech</h3>
                <p className="text-white/40 text-xs">پیشرو در توسعه AI</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              ما در Supreme Tech با تیمی متخصص در حوزه هوش مصنوعی و توسعه
              نرم‌افزار، راهکارهای نوآورانه را به کسب‌وکارها ارائه می‌دهیم.
            </p>
            {/* <div className="flex gap-2 mt-4 flex-wrap">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-lg">
                📱
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-lg">
                💼
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-lg">
                💻
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-lg">
                🐦
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-lg">
                📺
              </a>
            </div> */}
          </div>

          {/* ستون ۲: لینک‌های سریع */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">لینک‌های سریع</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/about"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  درباره ما
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  خدمات
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  رویدادها
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  وبلاگ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* ستون ۳: خدمات */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">خدمات ما</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/services"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  توسعه AI Agent
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  مشاوره هوش مصنوعی
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  توسعه نرم‌افزار
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  آموزش و کارگاه
                </Link>
              </li>
            </ul>
          </div>

          {/* ستون ۴: اطلاعات تماس */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">اطلاعات تماس</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60 text-sm hover:text-white transition-colors">
                <Phone size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <span className="break-all">۰۹۱۲۱۲۳۴۵۶۷</span>
              </li>
              <li className="flex items-start gap-3 text-white/60 text-sm hover:text-white transition-colors">
                <Mail size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <span className="break-all">info@supremetech.ir</span>
              </li>
              <li className="flex items-start gap-3 text-white/60 text-sm hover:text-white transition-colors">
                <MapPin size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <span>تهران، بزرگراه اشرفی اصفهانی، مجتمع نیایش</span>
              </li>
            </ul>
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="ایمیل خود را وارد کنید"
                  className="flex-1 px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-blue-500 transition-colors min-w-0"
                />
                <button className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 shrink-0">
                  <Send size={18} />
                </button>
              </div>
              <p className="text-white/40 text-xs mt-2">
                برای دریافت خبرنامه عضو شوید
              </p>
            </div>
          </div>
        </div>

        {/* 🔥 نمادهای اعتماد - جدید */}
        <div className="mt-10 lg:mt-12 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10">
              <Shield size={18} className="text-blue-400" />
              <span className="text-xs md:text-sm whitespace-nowrap">
                ضمانت کیفیت
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10">
              <Award size={18} className="text-amber-400" />
              <span className="text-xs md:text-sm whitespace-nowrap">
                ۱۰ سال تجربه
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10">
              <CheckCircle size={18} className="text-emerald-400" />
              <span className="text-xs md:text-sm whitespace-nowrap">
                تضمین رضایت
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10">
              <Clock size={18} className="text-purple-400" />
              <span className="text-xs md:text-sm whitespace-nowrap">
                پشتیبانی ۲۴/۷
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10">
              <Heart size={18} className="text-red-400" />
              <span className="text-xs md:text-sm whitespace-nowrap">
                عشق به فناوری
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10">
              <Globe size={18} className="text-cyan-400" />
              <span className="text-xs md:text-sm whitespace-nowrap">
                حضور جهانی
              </span>
            </div>
          </div>
        </div>

        {/* پایین فوتر - ریسپانسیو */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/40 text-xs sm:text-sm text-center sm:text-right">
            © {currentYear} تمامی حقوق برای{" "}
            <span className="text-white/60">Supreme Tech</span> محفوظ است.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
            <Link
              to="/privacy"
              className="text-white/40 hover:text-white transition-colors"
            >
              حریم خصوصی
            </Link>
            <span className="text-white/20">|</span>
            <Link
              to="/terms"
              className="text-white/40 hover:text-white transition-colors"
            >
              شرایط استفاده
            </Link>
            <span className="text-white/20">|</span>
            <Link
              to="/contact"
              className="text-white/40 hover:text-white transition-colors"
            >
              پشتیبانی
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
