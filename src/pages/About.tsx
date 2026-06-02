import { LiquidGlassCard } from "./../components/ui/LiquidGlassCard";
import { Brain, Lightbulb, Target, Users } from "lucide-react";

const values = [
  {
    icon: Users,
    title: "تیم متخصص",
    description: "تیمی از متخصصان با سال‌ها تجربه در حوزه‌های مختلف هوش مصنوعی",
    color: "from-blue-500 to-cyan-500",
    iconColor: "text-blue-400",
  },
  {
    icon: Lightbulb,
    title: "خلاقیت و نوآوری",
    description:
      "تیمی از متخصصان خلاق که هر چالش را به فرصتی برای نوآوری تبدیل می‌کنند",
    color: "from-yellow-500 to-amber-500",
    iconColor: "text-yellow-400",
  },
  {
    icon: Target,
    title: "هدفمندی",
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
              draggable={false}
              blurIntensity="md"
              borderRadius="100px"
              glowIntensity="sm"
              className="inline-flex px-4 py-2 mb-6"
            >
              <div className="inline-flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">
                  درباره SupremeTech
                </span>
              </div>
            </LiquidGlassCard>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              درباره ما
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            پیشرو در دنیای AI Agent ها
          </p>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Supreme Tech تیمی از متخصصان با تجربه در حوزه هوش مصنوعی است که با
            هدف شکل‌دهی به آینده و ایجاد تحول در کسب‌وکارها، AI Agent های هوشمند
            و قدرتمند را توسعه می‌دهد.
          </p>
        </div>

        {/* Mission Statement - کارت شیشه‌ای بزرگ */}
        <div className="mb-16">
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                مأموریت ما
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
              ما در Supreme Tech باور داریم که هوش مصنوعی قدرت تحول‌آفرینی در
              دنیای کسب‌وکار دارد. هدف ما این است که با توسعه AI Agent های
              پیشرفته، کسب‌وکارها را قادر سازیم تا بهره‌وری، خلاقیت و کیفیت
              خدمات خود را به سطح جدیدی برسانند. هدف ما خلق AI Agent هایی است که
              نه تنها هوشمند باشند بلکه خلاقیت و نوآوری را به کسب و کار ها
              بیاورند. ما معتقدیم که هوش مصنوعی باید ابزاری برای تقویت
              قابلیت‌های انسانی باشد نه جایگزینی برای آن‌ها.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {values.map((value, index) => (
            <div
              key={index}
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
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-blue-400 font-medium">
            آماده‌اید تا آینده کسب‌وکارتان را با AI Agent های Supreme Tech
            بسازید؟
          </p>
        </div>
      </div>
    </section>
  );
}
