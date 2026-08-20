import { useEffect, useState } from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { Building2, Loader2, ExternalLink } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
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
        // console.log("📦 داده‌های همکاران:", data);
        setPartners(data);
      } catch (err) {
        console.error("❌ خطا در دریافت همکاران:", err);
        setError("خطا در دریافت اطلاعات همکاران");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // 🔥 تابع باز کردن لینک
  const handlePartnerClick = (url: string | undefined, name: string) => {
    if (url && url !== "" && url !== "#") {
      // console.log("🔗 باز کردن لینک:", name, "->", url);
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      console.warn("⚠️ لینک معتبر نیست برای:", name);
    }
  };

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

  if (error) {
    return (
      <section className="py-8 px-3 md:py-16 md:px-6">
        <div className="container mx-auto text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
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

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-6">
          {partners.map((partner) => {
            const hasValidUrl =
              partner.website &&
              partner.website !== "" &&
              partner.website !== "#";

            return (
              <div
                key={partner.id}
                className={`flex flex-col items-center ${hasValidUrl ? "cursor-pointer" : "cursor-default"}`}
                onClick={() => {
                  if (hasValidUrl) {
                    handlePartnerClick(partner.website, partner.name);
                  }
                }}
              >
                <LiquidGlassCard
                  blurIntensity="lg"
                  glowIntensity="sm"
                  borderRadius="9999px"
                  className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 flex flex-col items-center justify-center group hover:scale-105 transition-all duration-300 relative"
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

                  {/* 🔥 آیکون لینک خارجی */}
                  {hasValidUrl && (
                    <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </LiquidGlassCard>

                {/* 🔥 اسم با قابلیت شکستن خط */}
                <div className="text-gray-400 text-[8px] md:text-xs group-hover:text-blue-400 transition mt-1 text-center max-w-[60px] md:max-w-[80px] lg:max-w-[96px] break-words leading-tight">
                  {partner.name}
                </div>
              </div>
            );
          })}
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
