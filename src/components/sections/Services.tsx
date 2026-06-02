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
    link: "/blog/ai-custom-agents",
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
    link: "/blog/ai-advanced-ml",
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
    link: "/blog/software-development",
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
    link: "/blog/cloud-infrastructure",
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
    link: "/blog/courses",
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
    link: "/blog/consulting",
  },
];

const scrollToContact = () => {
  const contactSection = document.getElementById("contact");
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: "smooth" });
  }
};

export default function Services() {
  return (
    <section id="services" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              خدمات ما
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            راهکارهای تخصصی برای رشد و پیشرفت کسب‌وکار شما در عصر هوش مصنوعی
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <LiquidGlassCard
              key={service.id}
              draggable={false}
              blurIntensity="lg"
              borderRadius="24px"
              glowIntensity="sm"
              className="group cursor-pointer hover:scale-105 transition-all duration-300 p-6"
            >
              {/* آیکون - مشکل حل شد */}
              <div
                className={`${service.bgColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <service.icon className={`w-7 h-7 ${service.iconColor}`} />
              </div>

              {/* عنوان */}
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {service.title}
              </h3>

              {/* توضیحات */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {service.description}
              </p>

              {/* ویژگی‌ها */}
              <div className="flex flex-wrap gap-2 mb-4">
                {service.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* دکمه */}
              <a href={service.link}>
                <button className="text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  بیشتر بدانید
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </a>
            </LiquidGlassCard>
          ))}
        </div>

        {/* Custom Solution Banner */}
        <div className="mt-12">
          <LiquidGlassCard
            draggable={false}
            blurIntensity="lg"
            borderRadius="32px"
            glowIntensity="md"
            className="p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-3">
              نیاز به راه‌حل سفارشی دارید؟
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              تیم Supreme Tech آماده است تا AI Agent های منحصر به فردی مطابق با
              نیازهای خاص کسب‌وکار شما طراحی و توسعه دهد
            </p>
            <LiquidGlassCard
              draggable={false}
              blurIntensity="lg"
              borderRadius="16px"
              glowIntensity="sm"
              className="overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300 inline-block"
            >
              <button
                onClick={scrollToContact}
                className="px-8 py-3 text-white font-bold flex items-center gap-2 justify-center 
                bg-gradient-to-r from-blue-500/80 to-blue-600/80 
                backdrop-blur-sm border border-blue-400/30"
              >
                مشاوره رایگان
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
            </LiquidGlassCard>
          </LiquidGlassCard>
        </div>
      </div>
    </section>
  );
}
