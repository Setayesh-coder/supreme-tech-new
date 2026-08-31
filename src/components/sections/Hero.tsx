// src/components/sections/Hero.tsx
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import HeroStats from "./HeroStats";

import { heroAPI } from "../../lib/api/hero";
import type { HeroSlide } from "../../lib/api/hero";

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  /*
   * Fallback فقط برای زمانی که Backend در دسترس نباشد
   */
  const defaultSlides: HeroSlide[] = [
    {
      id: "default-1",
      title: "ساختن ایده‌ها، تبدیلشان به محصول",
      subtitle: "توسعه نرم‌افزار، طراحی و راهکارهای هوشمند",
      description:
        "از ایده اولیه تا محصول نهایی، راهکارهای دیجیتال متناسب با نیاز کسب‌وکار شما طراحی و توسعه می‌دهیم.",
      image_url: "/assets/ai-hero-new.webp",
      button_text: "مشاهده خدمات",
      button_link: "/services",
      tagline: "راهکارهای دیجیتال",
      order: 0,
      is_active: true,
    },
  ];

  /*
   * دریافت Hero از Backend
   */
  useEffect(() => {
    let mounted = true;

    const fetchHeroSlides = async () => {
      try {
        setLoading(true);

        const data = await heroAPI.getAll();

        if (!mounted) return;

        const activeSlides = (data || [])
          .filter((slide) => slide.is_active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        if (activeSlides.length > 0) {
          setSlides(activeSlides);
          setCurrentIndex(0);
        } else {
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.error("Failed to load hero slides:", error);

        if (mounted) {
          setSlides(defaultSlides);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHeroSlides();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Auto play
   */
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = window.setInterval(() => {
      setDirection(1);

      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => {
      window.clearInterval(interval);
    };
  }, [slides.length]);

  /*
   * Navigation
   */
  const nextSlide = () => {
    if (slides.length <= 1) return;

    setDirection(1);

    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;

    setDirection(-1);

    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;

    setDirection(index > currentIndex ? 1 : -1);

    setCurrentIndex(index);
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <section
        className="
          w-full
          px-3
          pt-16
          sm:pt-20
          lg:pt-24
        "
      >
        <div
          className="
            mx-auto
            max-w-[1400px]

            h-[300px]
            sm:h-[380px]
            lg:h-[480px]

            rounded-[24px]
            sm:rounded-[32px]
            lg:rounded-[40px]

            bg-slate-950

            flex
            items-center
            justify-center
          "
        >
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      </section>
    );
  }

  if (!slides.length) {
    return null;
  }

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      dir="rtl"
      className="
        relative
        w-full

        px-3
        pt-16
        sm:pt-20
        lg:pt-24

        sm:px-5
        lg:px-8
      "
    >
      <div className="mx-auto max-w-[1400px]">
        {/* =================================================
            HERO
        ================================================== */}

        <div
          className="
            group
            relative
            overflow-hidden

            rounded-[24px]
            sm:rounded-[30px]
            lg:rounded-[40px]

            border
            border-white/10

            bg-slate-950

            shadow-[0_25px_80px_rgba(0,0,0,0.35)]

            /*
             * نسبت تصویر تنظیم‌شده برای لپ‌تاپ
             */
            aspect-[4/3]
            sm:aspect-[16/9]
            lg:aspect-[21/9]
            xl:aspect-[21/8]
          "
        >
          {/* =================================================
              BACKGROUND SLIDES
          ================================================== */}

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide.id}
              custom={direction}
              initial={{
                opacity: 0,
                scale: 1.04,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 1.02,
              }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-0"
            >
              {/* IMAGE */}

              <img
                src={currentSlide.image_url || "/assets/ai-hero-new.webp"}
                alt={currentSlide.title || "Supreme Tech"}
                className="
                  absolute
                  inset-0

                  h-full
                  w-full

                  object-cover
                  object-center

                  transition-transform
                  duration-[7000ms]

                  group-hover:scale-[1.02]
                "
                onError={(event) => {
                  event.currentTarget.src = "/assets/ai-hero-new.webp";
                }}
              />

              {/* =================================================
                  DESKTOP GRADIENT
              ================================================== */}

              <div
                className="
                  absolute
                  inset-0

                  hidden
                  lg:block

                  bg-gradient-to-l
                  from-slate-950
                  via-slate-950/75
                  to-slate-950/10
                "
              />

              {/* =================================================
                  MOBILE GRADIENT
              ================================================== */}

              <div
                className="
                  absolute
                  inset-0

                  lg:hidden

                  bg-gradient-to-t
                  from-slate-950
                  via-slate-950/60
                  to-slate-950/10
                "
              />

              {/* Subtle dark overlay */}

              <div
                className="
                  absolute
                  inset-0

                  bg-black/10
                "
              />
            </motion.div>
          </AnimatePresence>

          {/* =================================================
              CONTENT
          ================================================== */}

          <div
            className="
              absolute
              inset-0
              z-10

              flex
              items-center
              justify-center

              -translate-y-[2%]
              sm:-translate-y-[3%]
              lg:-translate-y-[4%]

              pointer-events-none
            "
          >
            <div
              className="
                w-full
                max-w-[900px]

                px-5
                sm:px-8
                lg:px-12

                flex
                flex-col
                items-center
                justify-center

                text-center

                pointer-events-auto
              "
            >
              {/* =================================================
                  TAGLINE
              ================================================== */}

              {currentSlide.tagline && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`tagline-${currentSlide.id}`}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="mb-2 sm:mb-3 lg:mb-4"
                  >
                    <LiquidGlassCard
                      blurIntensity="lg"
                      borderRadius="100px"
                      glowIntensity="sm"
                      className="
                        inline-flex

                        px-3
                        py-1

                        sm:px-4
                        sm:py-1.5

                        lg:px-5
                        lg:py-2

                        bg-white/10

                        border
                        border-white/20
                      "
                    >
                      <span
                        className="
                          text-[9px]
                          sm:text-xs
                          lg:text-sm

                          font-medium

                          text-white/80
                        "
                      >
                        {currentSlide.tagline ||
                          "مرکز توسعه فناوری‌های برتر تهران"}
                      </span>
                    </LiquidGlassCard>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* =================================================
                  TITLE
              ================================================== */}

              <AnimatePresence mode="wait">
                <motion.h1
                  key={`title-${currentSlide.id}`}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -15,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="
                    max-w-[700px]

                    text-2xl
                    leading-[1.35]

                    sm:text-3xl
                    sm:leading-[1.4]

                    lg:text-4xl
                    xl:text-5xl

                    font-bold

                    tracking-tight

                    text-white

                    drop-shadow-[0_3px_15px_rgba(0,0,0,0.35)]
                  "
                >
                  {currentSlide.title}
                </motion.h1>
              </AnimatePresence>

              {/* =================================================
                  SUBTITLE
              ================================================== */}

              {currentSlide.subtitle && (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`subtitle-${currentSlide.id}`}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: 0.08,
                    }}
                    className="
                      mt-1.5
                      sm:mt-2
                      lg:mt-3

                      max-w-[650px]

                      text-xs
                      leading-5

                      sm:text-base
                      sm:leading-7

                      lg:text-lg
                      xl:text-xl

                      font-medium

                      text-blue-200

                      drop-shadow-lg
                    "
                  >
                    {currentSlide.subtitle}
                  </motion.p>
                </AnimatePresence>
              )}

              {/* =================================================
                  DESCRIPTION
              ================================================== */}

              {currentSlide.description && (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`description-${currentSlide.id}`}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: 0.14,
                    }}
                    className="
                      mt-1.5

                      hidden
                      sm:block

                      max-w-[570px]

                      text-xs
                      leading-6

                      lg:text-sm
                      lg:leading-7

                      text-white/70
                    "
                  >
                    {currentSlide.description}
                  </motion.p>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* =================================================
              BOTTOM CONTROLS
          ================================================== */}

          <div
            className="
              absolute
              bottom-4
              left-4
              right-4

              sm:bottom-6
              sm:left-6
              sm:right-6

              lg:bottom-8
              lg:left-8
              lg:right-8

              z-20

              flex
              items-center
              justify-between

              gap-3
              sm:gap-4
            "
            dir="rtl"
          >
            {/* ===============================================
                CTA — RIGHT
            ================================================ */}

            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
                delay: 0.2,
              }}
            >
              <GlassButton
                icon={
                  <ArrowLeft
                    className="
                      h-3.5
                      w-3.5

                      sm:h-4
                      sm:w-4

                      transition-transform
                      duration-300

                      group-hover:-translate-x-1
                    "
                  />
                }
                iconPosition="right"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const link = currentSlide.button_link || "/services";

                  window.location.href = link;
                }}
                className="
                  text-[10px]
                  sm:text-xs
                  lg:text-sm

                  px-3
                  py-1.5

                  sm:px-4
                  sm:py-2

                  lg:px-5
                  lg:py-2.5

                  bg-white/10

                  border
                  border-white/20

                  backdrop-blur-xl

                  hover:bg-white/20

                  whitespace-nowrap
                "
              >
                {currentSlide.button_text || "مشاهده خدمات"}
              </GlassButton>
            </motion.div>

            {/* ===============================================
                SLIDER CONTROLS — LEFT
            ================================================ */}

            {slides.length > 1 && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.25,
                }}
                className="
                  flex
                  items-center
                  gap-1.5
                  sm:gap-2
                "
                dir="ltr"
              >
                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="اسلاید قبلی"
                >
                  <LiquidGlassCard
                    blurIntensity="lg"
                    borderRadius="100px"
                    glowIntensity="sm"
                    className="
                      flex
                      h-7
                      w-7

                      sm:h-9
                      sm:w-9

                      lg:h-10
                      lg:w-10

                      items-center
                      justify-center

                      bg-black/20

                      border
                      border-white/15

                      hover:bg-white/10

                      transition
                    "
                  >
                    <ChevronRight
                      className="
                        h-3
                        w-3

                        sm:h-3.5
                        sm:w-3.5

                        lg:h-4
                        lg:w-4

                        text-white
                      "
                    />
                  </LiquidGlassCard>
                </button>

                {/* DOTS */}

                <div
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goToSlide(index)}
                      aria-label={`اسلاید ${index + 1}`}
                      className="p-1"
                    >
                      <span
                        className={`
                          block
                          h-1
                          rounded-full

                          transition-all
                          duration-300

                          ${
                            index === currentIndex
                              ? "w-6 sm:w-7 bg-white"
                              : "w-1.5 bg-white/35"
                          }
                        `}
                      />
                    </button>
                  ))}
                </div>

                {/* NEXT */}

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="اسلاید بعدی"
                >
                  <LiquidGlassCard
                    blurIntensity="lg"
                    borderRadius="100px"
                    glowIntensity="sm"
                    className="
                      flex
                      h-7
                      w-7

                      sm:h-9
                      sm:w-9

                      lg:h-10
                      lg:w-10

                      items-center
                      justify-center

                      bg-black/20

                      border
                      border-white/15

                      hover:bg-white/10

                      transition
                    "
                  >
                    <ChevronLeft
                      className="
                        h-3
                        w-3

                        sm:h-3.5
                        sm:w-3.5

                        lg:h-4
                        lg:w-4

                        text-white
                      "
                    />
                  </LiquidGlassCard>
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <HeroStats />
      </div>
    </section>
  );
}
