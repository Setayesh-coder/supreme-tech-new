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
          pt-20
          sm:px-5
          sm:pt-24
          lg:px-8
        "
      >
        <div
          className="
            mx-auto
            max-w-[1400px]

            h-[380px]
            sm:h-[440px]
            lg:h-[580px]

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
        pt-20

        sm:px-5
        sm:pt-24

        lg:px-8
      "
    >
      <div className="mx-auto max-w-[1400px] ">
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
             * موبایل همچنان مستطیلی
             */
            aspect-[4/3]

            sm:aspect-[16/9]

            lg:aspect-[16/7]
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
          {/* =================================================
    CONTENT
================================================= */}

          <div
            className="
    absolute
    inset-0
    z-10

    flex
    items-center
    justify-center

    -translate-y-[4%]
    sm:-translate-y-[5%]
    lg:-translate-y-[6%]

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
                    className="mb-3 sm:mb-4"
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

                        bg-white/10

                        border
                        border-white/20
                      "
                    >
                      <span
                        className="
                          text-[9px]
                          sm:text-xs

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

                    text-[27px]
                    leading-[1.35]

                    sm:text-4xl
                    sm:leading-[1.4]

                    lg:text-5xl
                    xl:text-6xl

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
                      mt-2
                      sm:mt-3

                      max-w-[650px]

                      text-sm
                      leading-6

                      sm:text-lg
                      sm:leading-8

                      lg:text-xl

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
                      mt-2

                      hidden
                      sm:block

                      max-w-[570px]

                      text-sm
                      leading-7

                      lg:text-base
                      lg:leading-8

                      text-white/70
                    "
                  >
                    {currentSlide.description}
                  </motion.p>
                </AnimatePresence>
              )}

              {/* =================================================
                  BUTTON
              ================================================== */}
            </div>
          </div>

          {/* =================================================
    BOTTOM CONTROLS
================================================= */}

          <div
            className="
    absolute
    bottom-5
    left-5
    right-5 sm:bottom-7
    sm:left-7
    sm:right-7

    lg:bottom-8
    lg:left-8
    lg:right-8

    z-20

    flex
    items-center
    justify-between

    gap-4
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
            h-4
            w-4

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
        text-xs
        sm:text-sm

        px-4
        py-2

        sm:px-5
        sm:py-2.5

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
        gap-2
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
            h-8
            w-8

            sm:h-10
            sm:w-10

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
              h-3.5
              w-3.5

              sm:h-4
              sm:w-4

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

                ${index === currentIndex ? "w-7 bg-white" : "w-1.5 bg-white/35"}
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
            h-8
            w-8

            sm:h-10
            sm:w-10

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
              h-3.5
              w-3.5

              sm:h-4
              sm:w-4

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
