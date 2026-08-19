import { motion } from "framer-motion";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

interface HeroStat {
  id: string;
  number: string;
  label: string;
}

const stats: HeroStat[] = [
  {
    id: "projects",
    number: "۱۰۰+",
    label: "پروژه موفق",
  },
  {
    id: "support",
    number: "۲۴/۷",
    label: "پشتیبانی",
  },
  {
    id: "possibilities",
    number: "∞",
    label: "امکانات نامحدود",
  },
];

export default function HeroStats() {
  return (
    <section
      dir="rtl"
      className="
        relative
        z-20

        mt-4
        sm:mt-5
        lg:mt-6

        px-1
        sm:px-6
        lg:px-14
      "
    >
      <div
        className="
          grid
          grid-cols-3

          gap-2
          sm:gap-4
          lg:gap-6
        "
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.15 + index * 0.1,
            }}
            whileHover={{
              y: -4,
            }}
          >
            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="22px"
              glowIntensity="sm"
              className="
                w-full

                min-h-[78px]

                sm:min-h-[95px]

                lg:min-h-[110px]

                flex
                items-center
                justify-center

                px-2
                py-3

                sm:px-5
                sm:py-4

                lg:px-8
                lg:py-5

                bg-slate-950/65

                border
                border-white/10

                backdrop-blur-xl

                shadow-[0_15px_50px_rgba(0,0,0,0.18)]
              "
            >
              <div className="text-center">
                {/* Number */}

                <motion.div
                  className="
                    text-lg

                    sm:text-2xl

                    lg:text-4xl

                    font-bold

                    bg-gradient-to-r
                    from-blue-300
                    via-cyan-300
                    to-white

                    bg-clip-text
                    text-transparent
                  "
                  animate={{
                    opacity: [0.85, 1, 0.85],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {stat.number}
                </motion.div>

                {/* Label */}

                <div
                  className="
                    mt-1

                    text-[8px]

                    sm:text-xs

                    lg:text-sm

                    text-white/60
                  "
                >
                  {stat.label}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
