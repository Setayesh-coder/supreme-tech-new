// src/components/sections/Partners.tsx
import { useEffect, useState } from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { Building2, Loader2 } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo?: string;
  url?: string;
  order: number;
  isActive: boolean;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/partners?isActive=true`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        setPartners(data);
      } catch (err) {
        console.error("خطا در دریافت همکاران:", err);
        setError("خطا در دریافت اطلاعات همکاران");
        setPartners([
          {
            id: "1",
            name: "دانشگاه آزاد اسلامی",
            logo: "/assets/partners/iau-svgrepo-com.svg",
            url: "https://iau.ir/",
            order: 1,
            isActive: true,
          },
          {
            id: "2",
            name: "همکار ۲",
            logo: "",
            url: "#",
            order: 2,
            isActive: true,
          },
          {
            id: "3",
            name: "همکار ۳",
            logo: "",
            url: "#",
            order: 3,
            isActive: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section className="py-8 px-3 md:py-16 md:px-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-gray-400">بارگذاری همکاران...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error && partners.length === 0) {
    return (
      <section className="py-8 px-3 md:py-16 md:px-6">
        <div className="container mx-auto text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-3 md:py-16 md:px-6">
      <div className="container mx-auto">
        <div className="text-center mb-4 md:mb-8">
          <div className="flex justify-center">
            <LiquidGlassCard
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

        {partners.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>هنوز همکاری ثبت نشده است</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-6">
            {partners.map((partner) => (
              <a
                key={partner.id}
                href={partner.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <LiquidGlassCard
                  blurIntensity="lg"
                  glowIntensity="sm"
                  borderRadius="9999px"
                  className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 flex flex-col items-center justify-center group hover:scale-105 transition-all duration-300"
                  hoverScale={1.05}
                >
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Building2 className="w-5 h-5 md:w-7 md:h-7 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  )}
                </LiquidGlassCard>
                <div className="text-gray-400 text-[8px] md:text-xs group-hover:text-blue-400 transition mt-1 text-center max-w-[60px] md:max-w-[80px] lg:max-w-[96px] truncate">
                  {partner.name}
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="text-center mt-4 md:mt-6">
          <p className="text-[8px] md:text-xs text-gray-500">
            و ده‌ها همکار دیگر در سراسر کشور
          </p>
        </div>
      </div>
    </section>
  );
}
