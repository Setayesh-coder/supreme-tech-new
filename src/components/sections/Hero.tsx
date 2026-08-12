// src/components/sections/Hero.tsx
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Target,
  Loader2,
} from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { heroAPI } from "../../lib/api/hero";
import type { HeroSlide } from "../../lib/api/hero";
import { settingsAPI } from "../../lib/api/settings";
import { GlassButton } from "../ui/GlassButton";

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // // اسلایدهای پیش‌فرض
  const defaultSlides: HeroSlide[] = [
    {
      id: "default-1",
      title: "هوش مصنوعی در خدمت شما",
      subtitle: "پیشرو در توسعه AI Agent های هوشمند",
      description: "با تیم Supreme Tech، آینده فناوری را امروز تجربه کنید",
      // image: "/assets/ai-hero-new.webp",
      image_url: "/assets/ai-hero-new.webp",
      button_text: "شروع کنید",
      button_link: "/services",
      // color: "from-blue-400 to-cyan-400",
      order: 0,
      is_active: true,
      // heroTagline: "🚀 مرکز توسعه فناوری‌های برتر تهران",
    },
  ];
  //   {
  //     id: "default-2",
  //     title: "تحول دیجیتال با AI",
  //     subtitle: "بهینه‌سازی کسب‌وکار با هوش مصنوعی",
  //     description: "با استفاده از AI Agent های هوشمند، کارایی کسب‌وکار خود را چندین برابر کنید",
  //     // image: "/assets/ai-robot-hero.jpg",
  //     image_url: "/assets/ai-robot-hero.jpg",
  //     button_text: "مشاوره رایگان",
  //     buttonLink: "/contact",
  //     color: "from-purple-400 to-pink-400",
  //     order: 1,
  //     isActive: true,
  //     heroTagline: "🚀 مرکز توسعه فناوری‌های برتر تهران",
  //   },
  //   {
  //     id: "default-3",
  //     title: "آینده از امروز شروع می‌شود",
  //     subtitle: "همراه با پیشرفته‌ترین فناوری‌ها",
  //     description: "تیم Supreme Tech با تکیه بر دانش روز و تجربه، بهترین راه‌حل‌های هوشمند را ارائه می‌دهد",
  //     image: "/assets/ai-face-hero.jpg",
  //     image_url: "/assets/ai-face-hero.jpg",
  //     buttonText: "درباره ما",
  //     buttonLink: "/about",
  //     color: "from-green-400 to-teal-400",
  //     order: 2,
  //     isActive: true,
  //     heroTagline: "🚀 مرکز توسعه فناوری‌های برتر تهران",
  //   },
  // ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slidesData = await heroAPI.getAll();
        if (slidesData && slidesData.length > 0) {
          const activeSlides = slidesData
            .filter((slide) => slide.is_active !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          if (activeSlides.length > 0) {
            setSlides(activeSlides);
          } else {
            setSlides(defaultSlides);
          }
        } else {
          setSlides(defaultSlides);
        }

        const settingsData = await settingsAPI.getPublic();
        if (settingsData) {
          setSettings(settingsData);
        }
      } catch (error) {
        console.error("خطا در دریافت داده‌ها:", error);
        setSlides(defaultSlides);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="relative h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <p className="text-gray-400 text-lg">
            هیچ اسلایدی برای نمایش وجود ندارد
          </p>
        </div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];
  // const heroTagline = currentSlide.heroTagline || settings?.heroTagline || "🚀 مرکز توسعه فناوری‌های برتر تهران";

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* تصویر زمینه */}
      <div className="absolute inset-0">
        <img
          src={currentSlide.image_url || "/slides/ai-hero-new.webp"}
          alt={currentSlide.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const fallbackImages = [
              "/slides/ai-hero-new.webp",
              "/slides/ai-hero.webp",
              "/slides/ai-face-hero.jpg",
            ];
            const currentSrc = (e.target as HTMLImageElement).src;
            const index = fallbackImages.indexOf(currentSrc);
            const nextIndex = (index + 1) % fallbackImages.length;
            (e.target as HTMLImageElement).src = fallbackImages[nextIndex];
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* محتوای اسلاید */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 mt-16">
          <LiquidGlassCard
            blurIntensity="lg"
            borderRadius="100px"
            glowIntensity="sm"
            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10"
          >
            <span className="text-xs text-white/90 font-medium tracking-wider">
              {/* {heroTagline} */}
            </span>
          </LiquidGlassCard>
        </div>

        <div className="mb-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            {currentSlide.title}
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-yellow-400 drop-shadow-md">
            {currentSlide.subtitle}
          </p>
        </div>

        <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed drop-shadow-md">
          {currentSlide.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <GlassButton
            icon={<Target className="w-5 h-5" />}
            iconPosition="right"
            variant="primary"
            size="md"
            onClick={scrollToContact}
          >
            {currentSlide.button_link ? "بیشتر بدانید" : "درخواست مشاوره"}
          </GlassButton>

          <LiquidGlassCard
            blurIntensity="lg"
            borderRadius="16px"
            glowIntensity="sm"
            className="overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300"
          >
            <button
              onClick={() =>
                (window.location.href = currentSlide.button_link || "/contact")
              }
              className="px-8 py-3 text-white font-bold flex items-center gap-2 w-full justify-center 
                bg-gradient-to-r from-blue-500/80 to-blue-600/80 
                backdrop-blur-sm border border-blue-400/30"
            >
              {currentSlide.button_text || "شروع کنید"}
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </LiquidGlassCard>
        </div>
      </div>

      {/* دکمه‌های ناوبری */}
      {slides.length > 1 && (
        <>
          <button
            onClick={nextSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
          >
            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="100px"
              glowIntensity="sm"
              className="p-2 hover:scale-110 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </LiquidGlassCard>
          </button>
          <button
            onClick={prevSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
          >
            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="100px"
              glowIntensity="sm"
              className="p-2 hover:scale-110 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </LiquidGlassCard>
          </button>
        </>
      )}

      {/* نقطه‌های ناوبری */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="transition-all duration-300"
          >
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="100px"
              className={`p-0.5 ${index === currentIndex ? "w-8" : "w-2"} transition-all duration-300`}
            >
              <div
                className={`h-1 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
              />
            </LiquidGlassCard>
          </button>
        ))}
      </div>

      {/* آمار */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center gap-8 sm:gap-16">
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="20px"
              glowIntensity="sm"
              className="px-6 py-3 text-center min-w-[100px] bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                100+
              </div>
              <div className="text-xs text-white/80">پروژه موفق</div>
            </LiquidGlassCard>

            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="20px"
              glowIntensity="sm"
              className="px-6 py-3 text-center min-w-[100px] bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
                ۲۴/۷
              </div>
              <div className="text-xs text-white/80">پشتیبانی حرفه‌ای</div>
            </LiquidGlassCard>

            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="20px"
              glowIntensity="sm"
              className="px-6 py-3 text-center min-w-[100px] bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ∞
              </div>
              <div className="text-xs text-white/80">امکانات نامحدود</div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
