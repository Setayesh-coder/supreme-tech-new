import { LiquidGlassCard } from "./../ui/LiquidGlassCard";
import {
  Bot,
  Brain,
  Code,
  Cloud,
  GraduationCap,
  Zap,
  ArrowLeft,
} from "lucide-react";

const services = [
  {
    id: 1,
    icon: Bot,
    title: "AI Agents سفارشی",
    description: "طراحی و توسعه عوامل هوشمند متناسب با نیاز کسب‌وکار شما",
    features: ["پردازش زبان طبیعی", "یادگیری عمیق", "اتوماسیون هوشمند"],
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-400",
    link: "/blog/ایجنت-هوشمند-ai-agent-چیست؟-اتوماسیون-پیشرفته-و-کاهش-هزینههای-سازمان",
  },
  {
    id: 2,
    icon: Brain,
    title: "هوش مصنوعی پیشرفته",
    description: "پیاده‌سازی مدل‌های یادگیری عمیق و پردازش زبان طبیعی",
    features: ["مدل‌های GPT", "LLM سفارشی", "بینایی ماشین"],
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-400",
    link: "/blog/کاربردهای-یادگیری-عمیق-و-پردازش-زبان-طبیعی-nlp-در-حل-چالشهای-واقعی-کسبوکارها",
  },
  {
    id: 3,
    icon: Code,
    title: "توسعه نرم‌افزار",
    description: "برنامه‌نویسی و طراحی سایت با مدرن‌ترین تکنولوژی‌ها",
    features: ["React/Next.js", "Node.js/Python", "Microservices"],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-400",
    link: "/blog/راهنمای-انتخاب-پشته-فناوری-tech-stack-برای-توسعه-سایتها-و-سامانههای-مدرن",
  },
  {
    id: 4,
    icon: Cloud,
    title: "زیرساخت ابری",
    description: "استقرار و مدیریت AI Agents در بستر ابری با مقیاس‌پذیری بالا",
    features: ["AWS/Azure/GCP", "CI/CD", "مقیاس‌پذیری خودکار"],
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-400",
    link: "/blog/اهمیت-استقرار-ابری-و-معماری-مقیاسپذیر-در-بنچمارک-پروژههای-نرمافزاری-و-هوش-مصنوعی",
  },
  {
    id: 5,
    icon: GraduationCap,
    title: "دوره‌های آموزشی",
    description: "آموزش برنامه‌نویسی و هوش مصنوعی از مبتدی تا پیشرفته",
    features: ["Python", "Machine Learning", "Deep Learning"],
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-500/10",
    iconColor: "text-yellow-400",
    link: "/blog/نقشه-راه-یادگیری-برنامهنویسی-و-هوش-مصنوعی؛-از-صفر-تا-ورود-به-بازار-کار",
  },
  {
    id: 6,
    icon: Zap,
    title: "مشاوره تخصصی",
    description: "ارائه راهکارهای بهینه برای تحول دیجیتال کسب‌وکار",
    features: ["ارزیابی رایگان", "نقشه راه تحول", "پیاده‌سازی"],
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    link: "/blog/نقشه-راه-تحول-دیجیتال؛-چگونه-کسبوکارهای-سنتی-را-به-سامانههای-هوشمند-مجهز-کنیم؟",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="py-8 sm:py-12 md:py-20 px-3 sm:px-4 relative"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              خدمات ما
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-400 max-w-2xl mx-auto px-3 sm:px-4">
            راهکارهای تخصصی برای رشد و پیشرفت کسب‌وکار شما در عصر هوش مصنوعی
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {services.map((service) => (
            <LiquidGlassCard
              key={service.id}
              blurIntensity="lg"
              borderRadius="20px"
              glowIntensity="sm"
              className="group cursor-pointer hover:scale-105 transition-all duration-300 p-3 sm:p-4 md:p-6 h-full flex flex-col"
            >
              <div
                className={`${service.bgColor} w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform flex-shrink-0`}
              >
                <service.icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${service.iconColor}`}
                />
              </div>

              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white mb-1 sm:mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                {service.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-2 sm:mb-3 md:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3 md:mb-4">
                {service.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] xs:text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-white/10 text-gray-300 whitespace-nowrap"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <a href={service.link} className="inline-block mt-auto">
                <button className="text-blue-400 text-[10px] sm:text-xs md:text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  بیشتر بدانید
                  <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                </button>
              </a>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
