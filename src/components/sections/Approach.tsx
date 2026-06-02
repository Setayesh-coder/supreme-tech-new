import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { Cpu, Rocket, Shield, Zap, TrendingUp, Users, Target, Sparkles } from "lucide-react";

const approaches = [
  {
    icon: Target,
    title: "هدف‌محوری",
    description: "هر AI Agent با هدف مشخص و قابل اندازه‌گیری طراحی می‌شود",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Users,
    title: "مشارکت و همکاری",
    description: "مشتری ما شریک پروژه است و در تمام مراحل حضور فعال دارد",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: Sparkles,
    title: "نوآوری مداوم",
    description: "همیشه در جستجوی راه‌حل‌های خلاقانه‌تر و کارآمدتر",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: Brain,
    title: "هوش انسانی محور",
    description: "AI Agent برای تقویت توانایی‌های انسان طراحی می‌شوند",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Shield,
    title: "امنیت و قابلیت اطمینان",
    description: "حفاظت از داده‌ها و حریم خصوصی در بالاترین سطح",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Zap,
    title: "توسعه سریع و چابک",
    description: "متدولوژی‌های مدرن برای تحویل سریع و کیفی",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Cpu,
    title: "تکنولوژی پیشرفته",
    description: "بهره‌گیری از جدیدترین فناوری‌ها و ابزارهای AI",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: TrendingUp,
    title: "کیفیت و تمیزی کد",
    description: "کدهای تمیز، قابل نگهداری و مقیاس‌پذیر",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
];

export default function Approach() {
  return (
    <section id="approach" className="py-24 px-6 relative overflow-hidden">
      {/* پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-blue-500/5" />

      <div className="container mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <LiquidGlassCard
            draggable={false}
            blurIntensity="lg"
            borderRadius="100px"
            glowIntensity="sm"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2"
          >
            <Rocket className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">رویکرد ما</span>
          </LiquidGlassCard>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-l from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              چگونه کار می‌کنیم؟
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            رویکرد ما در Supreme Tech بر پایه اصول اساسی استوار است که تضمین‌کننده کیفیت، 
            نوآوری و موفقیت پروژه‌های شماست
          </p>
        </div>

        {/* Approaches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {approaches.map((item, index) => (
            <LiquidGlassCard
              key={index}
              draggable={false}
              blurIntensity="lg"
              borderRadius="20px"
              glowIntensity="sm"
              className="group cursor-pointer hover:scale-105 transition-all duration-300 p-6 text-center"
            >
              <div className={`${item.bgColor} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h4 className="text-base font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                {item.description}
              </p>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
