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

  // اسلایدهای پیش‌فرض
  const defaultSlides: HeroSlide[] = [
    {
      id: "default-1",
      title: "هوش مصنوعی در خدمت شما",
      subtitle: "پیشرو در توسعه AI Agent های هوشمند",
      description: "با تیم Supreme Tech، آینده فناوری را امروز تجربه کنید",
      image_url: "/assets/ai-hero-new.webp",
      button_text: "شروع کنید",
      button_link: "/services",
      order: 0,
      is_active: true,
    },
  ];

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
  const heroTagline =
    currentSlide.tagline || "🚀 مرکز توسعه فناوری‌های برتر تهران";

  return (
    <section className="relative w-full py-4 sm:py-6 px-2 sm:px-4">
      {/* کانتینر با اندازه دیجیکالا */}
      <div className="max-w-[1336px] mx-auto mt-20">
        {/* اسلاید با نسبت ۲:۱ */}
        <div className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden shadow-2xl">
          {/* Border شیشه‌ای دور عکس - مثل Liquid Glass */}
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-white/30 via-white/10 to-white/5 backdrop-blur-sm z-0">
            <div className="absolute inset-[2px] rounded-2xl overflow-hidden">
              {/* تصویر زمینه */}
              <div className="absolute inset-0">
                <img
                  src={currentSlide.image_url || "/slides/ai-hero-new.webp"}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    const fallbackImages = [
                      "/slides/ai-hero-new.webp",
                      "/slides/ai-hero.webp",
                      "/slides/ai-face-hero.jpg",
                    ];
                    const currentSrc = (e.target as HTMLImageElement).src;
                    const index = fallbackImages.indexOf(currentSrc);
                    const nextIndex = (index + 1) % fallbackImages.length;
                    (e.target as HTMLImageElement).src =
                      fallbackImages[nextIndex];
                  }}
                />
              </div>
            </div>
          </div>

          {/* محتوای اسلاید */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-3 sm:px-8 lg:px-12">
            {/* تگلاین - پایین‌تر از قبل */}
            <div className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2">
              <LiquidGlassCard
                blurIntensity="lg"
                borderRadius="100px"
                glowIntensity="sm"
                className="px-2.5 sm:px-4 py-1 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20"
              >
                <span className="text-[8px] sm:text-xs text-white/90 font-medium tracking-wider whitespace-nowrap">
                  {heroTagline}
                </span>
              </LiquidGlassCard>
            </div>

            {/* عنوان */}
            <h1 className="text-lg sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-1 sm:mb-3 leading-tight drop-shadow-lg max-w-4xl px-1">
              {currentSlide.title}
            </h1>

            {/* زیرعنوان */}
            <p className="text-sm sm:text-xl lg:text-2xl font-semibold text-yellow-400 drop-shadow-md mb-1 sm:mb-4">
              {currentSlide.subtitle}
            </p>

            {/* توضیحات */}
            <p className="text-xs sm:text-sm lg:text-base text-white/90 max-w-2xl mx-auto mb-2 sm:mb-6 leading-relaxed drop-shadow-md px-2">
              {currentSlide.description}
            </p>

            {/* دکمه‌ها - یکسان در موبایل و دسکتاپ */}
            <div className="flex flex-row gap-2 sm:gap-4 items-center justify-center">
              <GlassButton
                icon={<Target className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                iconPosition="right"
                variant="primary"
                size="sm"
                onClick={scrollToContact}
                className="text-xs sm:text-base px-4 sm:px-8 py-1.5 sm:py-2.5 whitespace-nowrap"
              >
                {currentSlide.button_link ? "بیشتر بدانید" : "درخواست مشاوره"}
              </GlassButton>

              <GlassButton
                icon={
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                }
                iconPosition="left"
                variant="secondary"
                size="sm"
                onClick={() =>
                  (window.location.href =
                    currentSlide.button_link || "/contact")
                }
                className="text-xs sm:text-base px-4 sm:px-8 py-1.5 sm:py-2.5 whitespace-nowrap bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20"
              >
                {currentSlide.button_text || "شروع کنید"}
              </GlassButton>
            </div>
          </div>

          {/* دکمه‌های ناوبری - Liquid Glass */}
          {slides.length > 1 && (
            <>
              <button
                onClick={nextSlide}
                className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 z-20"
              >
                <LiquidGlassCard
                  blurIntensity="lg"
                  borderRadius="100px"
                  glowIntensity="sm"
                  className="p-1 sm:p-2 hover:scale-110 transition-all duration-300 bg-black/30 backdrop-blur-md border border-white/20"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </LiquidGlassCard>
              </button>
              <button
                onClick={prevSlide}
                className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 z-20"
              >
                <LiquidGlassCard
                  blurIntensity="lg"
                  borderRadius="100px"
                  glowIntensity="sm"
                  className="p-1 sm:p-2 hover:scale-110 transition-all duration-300 bg-black/30 backdrop-blur-md border border-white/20"
                >
                  <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </LiquidGlassCard>
              </button>
            </>
          )}

          {/* نقطه‌های ناوبری - Liquid Glass */}
          <div className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-1 sm:gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="transition-all duration-300"
              >
                <LiquidGlassCard
                  blurIntensity="md"
                  borderRadius="100px"
                  glowIntensity="sm"
                  className={`p-0.5 ${index === currentIndex ? "w-4 sm:w-8" : "w-1 sm:w-2"} transition-all duration-300 bg-white/20 backdrop-blur-sm border border-white/20`}
                >
                  <div
                    className={`h-0.5 sm:h-1 rounded-full ${
                      index === currentIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                </LiquidGlassCard>
              </button>
            ))}
          </div>
        </div>

        {/* آمار - Liquid Glass با گوشه‌های گردتر */}
        <div className="mt-3 sm:mt-6">
          <div className="flex justify-center gap-2 sm:gap-8 flex-wrap">
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="20px"
              glowIntensity="sm"
              className="px-2.5 sm:px-6 py-1 sm:py-3 text-center min-w-[50px] sm:min-w-[100px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl"
            >
              <div className="text-[10px] sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ۱۰۰+
              </div>
              <div className="text-[6px] sm:text-xs text-white/70">
                پروژه موفق
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="20px"
              glowIntensity="sm"
              className="px-2.5 sm:px-6 py-1 sm:py-3 text-center min-w-[50px] sm:min-w-[100px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl"
            >
              <div className="text-[10px] sm:text-2xl font-bold text-yellow-400">
                ۲۴/۷
              </div>
              <div className="text-[6px] sm:text-xs text-white/70">
                پشتیبانی
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="20px"
              glowIntensity="sm"
              className="px-2.5 sm:px-6 py-1 sm:py-3 text-center min-w-[50px] sm:min-w-[100px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl"
            >
              <div className="text-[10px] sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ∞
              </div>
              <div className="text-[6px] sm:text-xs text-white/70">
                امکانات نامحدود
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
