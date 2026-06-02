import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { Building2 } from "lucide-react";

const partners = [
  {
    name: "دانشگاه آزاد اسلامی",
    logo: "/assets/partners/iau-svgrepo-com.svg",
    url: "https://iau.ir/",
  },
  { name: "همکار ۲", logo: "", url: "#" },
  { name: "همکار ۳", logo: "", url: "#" },
  { name: "همکار ۴", logo: "", url: "#" },
  { name: "همکار ۵", logo: "", url: "#" },
  { name: "همکار ۶", logo: "", url: "#" },
];

export default function Partners() {
  return (
    <section className="py-8 px-3 md:py-16 md:px-6">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <div className="flex justify-center">
            <LiquidGlassCard
              draggable={false}
              blurIntensity="md"
              borderRadius="100px"
              glowIntensity="sm"
              className="inline-flex px-2 md:px-4 py-1 md:py-2 mb-3 md:mb-6"
            >
              <div className="inline-flex items-center gap-1 md:gap-2">
                <Building2 className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-400" />
                <span className="text-[9px] md:text-sm font-medium text-gray-300">
                  همکاران ما
                </span>
              </div>
            </LiquidGlassCard>
          </div>
          <h3 className="text-sm md:text-xl font-bold text-white">
            افتخار همکاری با بهترین‌ها
          </h3>
          <p className="text-[9px] md:text-sm text-gray-400 mt-1 md:mt-2">
            مجموعه‌ای از شرکت‌های پیشرو به ما اعتماد کرده‌اند
          </p>
        </div>

        {/* لیست همکاران - افقی با wrap */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-6">
          {partners.map((partner, index) => (
            <a
              key={index}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <LiquidGlassCard
                draggable={false}
                blurIntensity="lg"
                glowIntensity="sm"
                borderRadius="9999px"
                className="w-16 h-16 md:w-28 md:h-28 lg:w-32 lg:h-32 flex flex-col items-center justify-center group hover:scale-105 transition-all duration-300"
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-8 h-8 md:w-14 md:h-14 lg:w-16 lg:h-16 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Building2 className="w-5 h-5 md:w-10 md:h-10 text-gray-500" />
                )}
              </LiquidGlassCard>
              <div className="text-gray-400 text-[8px] md:text-xs group-hover:text-blue-400 transition mt-1 text-center">
                {partner.name.length > 12 ? partner.name.slice(0, 10) + '...' : partner.name}
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-4 md:mt-6">
          <p className="text-[8px] md:text-xs text-gray-500">
            و ده‌ها همکار دیگر در سراسر کشور
          </p>
        </div>
      </div>
    </section>
  );
}
