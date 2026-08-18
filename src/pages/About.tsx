import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import {
  Brain,
  Lightbulb,
  Target,
  Users,
  Code,
  Globe,
  Sparkles,
  Bot,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

// تغییر در values برای پوشش هر دو حوزه
const values = [
  {
    icon: Users,
    title: "تیم متخصص",
    description:
      "تیمی از متخصصان هوش مصنوعی، طراحان خلاق و توسعه‌دهندگان حرفه‌ای",
    color: "from-blue-500 to-cyan-500",
    iconColor: "text-blue-400",
  },
  {
    icon: Lightbulb,
    title: "خلاقیت و نوآوری",
    description:
      "هر چالش را به فرصتی برای نوآوری در طراحی و توسعه تبدیل می‌کنیم",
    color: "from-yellow-500 to-amber-500",
    iconColor: "text-yellow-400",
  },
  {
    icon: Target,
    title: "هدفمندی در عمل",
    description:
      "تمرکز بر نیازهای واقعی مشتریان و ارائه راه‌حل‌های عملی و مؤثر",
    color: "from-green-500 to-emerald-500",
    iconColor: "text-green-400",
  },
  {
    icon: Brain,
    title: "هوش مصنوعی پیشرفته",
    description:
      "استفاده از جدیدترین تکنولوژی‌های AI برای خلق راه‌حل‌های نوآورانه",
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-400",
  },
];

// سرویس‌های جدید
const services = [
  {
    icon: Code,
    title: "طراحی و توسعه وب",
    description:
      "سایت‌های ریسپانسیو، فوق‌سریع و بهینه‌شده با React، Next.js و Tailwind",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Bot,
    title: "AI Agent های سفارشی",
    description:
      "دستیارهای هوشمند، چت‌بات‌های پیشرفته و سیستم‌های تصمیم‌گیرنده",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "ادغام هوش مصنوعی در وب",
    description:
      "تبدیل سایت شما به پلتفرمی هوشمند با قابلیت شخصی‌سازی و تحلیل داده",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Globe,
    title: "پنل مدیریت پیشرفته",
    description: "داشبوردهای حرفه‌ای با قابلیت اتوماسیون و گزارش‌گیری هوشمند",
    color: "from-green-500 to-emerald-500",
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6 relative overflow-hidden">
      {/* پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5" />

      <div className="container mx-auto relative z-10">
        {/* Header - شیشه‌ای */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="100px"
              glowIntensity="sm"
              className="inline-flex px-4 py-2 mb-6"
            >
              <div className="inline-flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">
                  درباره SupremeTech
                </span>
                {/* 🔥 مسیر مطلق برای لوگو */}
                <img
                  src="/favicon/favicon-96x96.png"
                  alt="supreme tech"
                  className="w-8 h-8"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/favicon.ico";
                  }}
                />
              </div>
            </LiquidGlassCard>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              درباره ما
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-2">
            پیشرو در توسعه پلتفرم‌های هوشمند
          </p>

          <p className="text-base text-gray-500 max-w-3xl mx-auto leading-relaxed">
            هوش مصنوعی + طراحی مدرن = تحول دیجیتال
          </p>
        </div>

        {/* Mission Statement - کارت شیشه‌ای بزرگ */}
        <div className="mb-16 max-w-4xl mx-auto">
          <LiquidGlassCard
            blurIntensity="lg"
            borderRadius="32px"
            glowIntensity="md"
            className="p-8"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Target className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  مأموریت ما
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                ما در Supreme Tech باور داریم که آینده‌ی کسب‌وکارها در{" "}
                <span className="text-blue-400 font-semibold">
                  ادغام هوشمندانه‌ی طراحی انسانی با قدرت ماشین
                </span>{" "}
                است. هدف ما این است که با ارائه‌ی پلتفرم‌های وب هوشمند،
                کسب‌وکارها را به سطح جدیدی از بهره‌وری، تعامل و نوآوری برسانیم.
              </p>
              <p className="text-gray-400 leading-relaxed mt-4 text-sm">
                فرقی نمی‌کند به یک{" "}
                <span className="text-cyan-400">سایت فروشگاهی حرفه‌ای</span>{" "}
                نیاز دارید یا یک{" "}
                <span className="text-purple-400">
                  سیستم هوشمند تصمیم‌گیرنده با AI
                </span>{" "}
                – ما راه‌حلی متناسب با نیاز شما طراحی می‌کنیم.
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-gray-500 text-sm">
                  💡 طراحی سایت بدون هوش مصنوعی = فقط یک ویترین
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  🧠 هوش مصنوعی بدون طراحی کاربرپسند = قابل استفاده نیست
                </p>
                <p className="text-blue-400 text-sm font-semibold mt-3">
                  ✨ ما این دو را کنار هم می‌گذاریم تا معجزه رقم بزنیم ✨
                </p>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Values Grid - ارزش‌های ما */}
        <h3 className="text-2xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
            ارزش‌های ما
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {values.map((value, index) => (
            <LiquidGlassCard
              key={index}
              blurIntensity="md"
              borderRadius="24px"
              glowIntensity="sm"
              className="group cursor-pointer hover:scale-105 transition-all duration-300 p-6 text-center"
            >
              <div
                className={`bg-gradient-to-r ${value.color} bg-opacity-10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300`}
                style={{
                  backgroundColor: `${value.color.split(" ")[1]?.replace("to-", "").replace("-500", "")}10`,
                }}
              >
                <value.icon className={`w-8 h-8 ${value.iconColor}`} />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {value.title}
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {value.description}
              </p>
            </LiquidGlassCard>
          ))}
        </div>

        {/* Services Grid - خدمات ما */}
        <h3 className="text-2xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
            خدمات ما
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {services.map((service, index) => (
            <LiquidGlassCard
              key={index}
              blurIntensity="md"
              borderRadius="24px"
              glowIntensity="sm"
              className="p-6 text-center hover:scale-105 transition-all duration-300"
            >
              <div
                className={`bg-gradient-to-r ${service.color} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-base font-semibold text-white mb-2">
                {service.title}
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                {service.description}
              </p>
            </LiquidGlassCard>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link to="/contact" className="inline-block">
            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="100px"
              glowIntensity="md"
              className="px-8 py-4 cursor-pointer hover:scale-105 transition-all duration-300 group"
            >
              <p className="text-lg text-blue-400 font-medium flex items-center gap-2">
                آماده‌اید تا آینده کسب‌وکارتان را با Supreme Tech بسازید؟
                <ArrowLeft />
              </p>
            </LiquidGlassCard>
          </Link>
        </div>
      </div>
    </section>
  );
}
