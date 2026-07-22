// src/components/sections/Approach.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import {
  Search,
  PenTool,
  Code,
  Rocket,
  type LucideIcon, // ← اضافه شد
} from "lucide-react";

// ... بقیه imports

interface ApproachItem {
  icon: LucideIcon; // ← نوع درست
  title: string;
  description: string;
  step: string;
}

const approachItems: ApproachItem[] = [
  {
    icon: Search,
    title: "تحلیل و کشف",
    description: "شناسایی دقیق نیازها و فرصت‌های کسب‌وکار",
    step: "گام اول",
  },
  {
    icon: PenTool,
    title: "طراحی تجربه",
    description: "خلق تجربه کاربری منحصربه‌فرد و کاربرپسند",
    step: "گام دوم",
  },
  {
    icon: Code,
    title: "توسعه هوشمند",
    description: "پیاده‌سازی با جدیدترین تکنولوژی‌ها و AI",
    step: "گام سوم",
  },
  {
    icon: Rocket,
    title: "پرتاب و رشد",
    description: "راه‌اندازی، بهینه‌سازی و رشد مستمر",
    step: "گام چهارم",
  },
];

export default function Approach() {
  return (
    <section id="approach" className="py-24 px-6">
      <div className="container mx-auto">
        {/* ... بقیه JSX */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {approachItems.map((item, index) => (
            <LiquidGlassCard
              key={index}
              className="p-6 text-center"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              hoverScale={1.03}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                {/* ✅ استفاده درست از آیکون */}
                <item.icon className="w-8 h-8 text-blue-400" />
              </div>
              <span className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                {item.step}
              </span>
              <h4 className="text-lg font-semibold text-white mt-3">
                {item.title}
              </h4>
              <p className="text-gray-400 text-sm mt-2">{item.description}</p>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
