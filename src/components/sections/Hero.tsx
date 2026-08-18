// src/components/sections/Hero.tsx
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Target,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
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
  const [direction, setDirection] = useState(0);

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
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // انیمیشن‌های اسلاید
  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.6 },
        scale: { duration: 0.5 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.4 },
      },
    }),
  };

  // انیمیشن‌های متن
  const textVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    }),
  };

  if (loading) {
    return (
      <section className="relative h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-blue-400" />
        </motion.div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-gray-400 text-lg">
            هیچ اسلایدی برای نمایش وجود ندارد
          </p>
        </motion.div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];
  const heroTagline =
    currentSlide.tagline || "مرکز توسعه فناوری‌های برتر تهران";

  return (
    <section className="relative w-full py-2 sm:py-4 px-1 sm:px-2">
      <div className="max-w-[1336px] mx-auto mt-16 sm:mt-20">
        {/* اسلاید با نسبت ۲:۱ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative aspect-[2/1] w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Border شیشه‌ای */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 rounded-xl sm:rounded-2xl p-[2px] bg-gradient-to-br from-white/30 via-white/10 to-white/5 backdrop-blur-sm z-0"
          >
            <div className="absolute inset-[2px] rounded-xl sm:rounded-2xl overflow-hidden">
              {/* تصویر زمینه با انیمیشن */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0"
                >
                  {/* لایه‌های تیره‌کننده - تیره‌تر شده */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-5" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-5" />
                  <div className="absolute inset-0 bg-black/30 z-5" />

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
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* محتوای اسلاید - بهبود یافته برای موبایل */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-2 sm:px-8 lg:px-12">
            {/* تگلاین */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute top-2 sm:top-6 flex justify-center"
            >
              <LiquidGlassCard
                blurIntensity="lg"
                borderRadius="100px"
                glowIntensity="sm"
                className="px-2 sm:px-4 py-0.5 sm:py-1.5 bg-black/40 backdrop-blur-md border border-white/30"
              >
                <motion.span
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="text-[7px] sm:text-xs text-white font-medium tracking-wider whitespace-nowrap"
                >
                  {heroTagline}
                </motion.span>
              </LiquidGlassCard>
            </motion.div>

            {/* عنوان - بزرگتر و واضح‌تر */}
            <motion.h1
              custom={0}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="text-xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-0.5 sm:mb-3 leading-tight drop-shadow-2xl max-w-4xl px-1"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={`title-${currentIndex}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block text-shadow-xl"
                >
                  {currentSlide.title}
                </motion.span>
              </AnimatePresence>
            </motion.h1>

            {/* زیرعنوان - واضح‌تر */}
            <motion.p
              custom={1}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="text-sm sm:text-xl lg:text-2xl font-bold text-yellow-400 drop-shadow-2xl mb-0.5 sm:mb-4"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={`subtitle-${currentIndex}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-shadow-lg"
                >
                  {currentSlide.subtitle}
                </motion.span>
              </AnimatePresence>
            </motion.p>

            {/* توضیحات - کوچکتر در موبایل */}
            <motion.p
              custom={2}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="text-[10px] sm:text-sm lg:text-base text-white/95 max-w-2xl mx-auto mb-1.5 sm:mb-6 leading-relaxed drop-shadow-2xl px-2 font-medium"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={`description-${currentIndex}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {currentSlide.description}
                </motion.span>
              </AnimatePresence>
            </motion.p>

            {/* دکمه‌ها - کوچکتر در موبایل */}
            <motion.div
              custom={3}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-row gap-1.5 sm:gap-4 items-center justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <GlassButton
                  icon={<Target className="w-3 h-3 sm:w-5 sm:h-5" />}
                  iconPosition="right"
                  variant="primary"
                  size="sm"
                  onClick={scrollToContact}
                  className="text-[10px] sm:text-base px-3 sm:px-8 py-1 sm:py-2.5 whitespace-nowrap"
                >
                  درخواست مشاوره
                </GlassButton>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <GlassButton
                  icon={
                    <ArrowLeft className="w-3 h-3 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                  }
                  iconPosition="left"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    (window.location.href =
                      currentSlide.button_link || "/contact")
                  }
                  className="text-[10px] sm:text-base px-3 sm:px-8 py-1 sm:py-2.5 whitespace-nowrap bg-black/40 backdrop-blur-md border border-white/40 hover:bg-black/60"
                >
                  {currentSlide.button_text || "شروع کنید"}
                </GlassButton>
              </motion.div>
            </motion.div>
          </div>

          {/* دکمه‌های ناوبری - کوچکتر در موبایل */}
          {slides.length > 1 && (
            <>
              <motion.button
                onClick={nextSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20"
              >
                <LiquidGlassCard
                  blurIntensity="lg"
                  borderRadius="100px"
                  glowIntensity="sm"
                  className="p-0.5 sm:p-2 hover:scale-110 transition-all duration-300 bg-black/50 backdrop-blur-md border border-white/30"
                >
                  <ChevronLeft className="w-2.5 h-2.5 sm:w-5 sm:h-5 text-white" />
                </LiquidGlassCard>
              </motion.button>
              <motion.button
                onClick={prevSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20"
              >
                <LiquidGlassCard
                  blurIntensity="lg"
                  borderRadius="100px"
                  glowIntensity="sm"
                  className="p-0.5 sm:p-2 hover:scale-110 transition-all duration-300 bg-black/50 backdrop-blur-md border border-white/30"
                >
                  <ChevronRight className="w-2.5 h-2.5 sm:w-5 sm:h-5 text-white" />
                </LiquidGlassCard>
              </motion.button>
            </>
          )}

          {/* نقطه‌های ناوبری - کوچکتر در موبایل */}
          <div className="absolute bottom-1.5 sm:bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-0.5 sm:gap-2 z-20">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="transition-all duration-300"
              >
                <LiquidGlassCard
                  blurIntensity="md"
                  borderRadius="100px"
                  glowIntensity="sm"
                  className={`p-0.5 transition-all duration-300 bg-black/50 backdrop-blur-sm border border-white/30 ${
                    index === currentIndex ? "w-3 sm:w-8" : "w-1 sm:w-2"
                  }`}
                >
                  <motion.div
                    className={`h-0.5 sm:h-1 rounded-full ${
                      index === currentIndex ? "bg-white" : "bg-white/40"
                    }`}
                    animate={{
                      opacity: index === currentIndex ? 1 : 0.4,
                      scale: index === currentIndex ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </LiquidGlassCard>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* آمار - کوچکتر در موبایل */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-2 sm:mt-6"
        >
          <div className="flex justify-center gap-1.5 sm:gap-8 flex-wrap">
            {[
              {
                number: "۱۰۰+",
                label: "پروژه موفق",
                color: "from-blue-400 to-cyan-400",
              },
              { number: "۲۴/۷", label: "پشتیبانی", color: "text-yellow-400" },
              {
                number: "∞",
                label: "امکانات نامحدود",
                color: "from-blue-400 to-cyan-400",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 },
                }}
              >
                <LiquidGlassCard
                  blurIntensity="md"
                  borderRadius="16px"
                  glowIntensity="sm"
                  className="px-2 sm:px-6 py-0.5 sm:py-3 text-center min-w-[40px] sm:min-w-[100px] bg-black/40 backdrop-blur-md border border-white/15 rounded-xl"
                >
                  <motion.div
                    className={`text-[8px] sm:text-2xl font-bold ${
                      stat.color.startsWith("from")
                        ? `bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`
                        : stat.color
                    }`}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-[5px] sm:text-xs text-white/70">
                    {stat.label}
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
