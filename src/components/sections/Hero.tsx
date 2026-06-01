import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, Target } from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { slides } from "../../constants/slides";

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* تصویر زمینه */}
      <div className="absolute inset-0">
        <img
          src={currentSlide.image}
          alt={currentSlide.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* محتوای اسلاید */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        {/* تگ بالایی - شیشه‌ای */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 mt-16">
          <LiquidGlassCard
            draggable={false}
            blurIntensity="lg"
            borderRadius="100px"
            className="px-4 py-2"
          >
            <span className="text-xs text-white">
              مرکز توسعه فناوری‌های برتر تهران
            </span>
          </LiquidGlassCard>
        </div>

        {/* عنوان */}
        <div className="mb-6">
          <LiquidGlassCard
            draggable={false}
            blurIntensity="md"
            borderRadius="100px"
            glowIntensity="sm"
            className="inline-flex px-4 py-2 mb-6"
          >
            <span
              className={`text-sm font-bold bg-gradient-to-r ${currentSlide.color} bg-clip-text text-transparent`}
            >
              {currentSlide.title}
            </span>
          </LiquidGlassCard>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4">
            {currentSlide.title}
          </h1>

          <p className="text-xl sm:text-2xl lg:text-3xl text-yellow-400 font-medium">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* توضیحات */}
        <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
          {currentSlide.description}
        </p>

        {/* دکمه‌های شیشه‌ای */}
        <div className="flex flex-col sm:flex-row gap-4">
          <LiquidGlassCard
            draggable={false}
            blurIntensity="lg"
            borderRadius="16px"
            glowIntensity="sm"
            className="overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300"
          >
            <button
              onClick={scrollToContact}
              className="px-8 py-3 text-white font-bold flex items-center gap-2 w-full justify-center bg-white/10 backdrop-blur-sm"
            >
              {currentSlide.buttonText}

              <Target className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </LiquidGlassCard>
          <LiquidGlassCard
            draggable={false}
            blurIntensity="lg"
            borderRadius="16px"
            glowIntensity="sm"
            className="overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300"
          >
            <button
              onClick={() => (window.location.href = "/")}
              className="px-8 py-3 text-white font-bold flex items-center gap-2 w-full justify-center 
             bg-gradient-to-r from-blue-500/80 to-blue-600/80 
             backdrop-blur-sm border border-blue-400/30"
            >
              در خواست مشاوره
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </LiquidGlassCard>
        </div>
      </div>

      {/* دکمه‌های ناوبری شیشه‌ای */}
      <button
        onClick={nextSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
      >
        <LiquidGlassCard
          draggable={false}
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
          draggable={false}
          blurIntensity="lg"
          borderRadius="100px"
          glowIntensity="sm"
          className="p-2 hover:scale-110 transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </LiquidGlassCard>
      </button>

      {/* نقطه‌های ناوبری شیشه‌ای */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="transition-all duration-300"
          >
            <LiquidGlassCard
              draggable={false}
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

      {/* آمار پایین صفحه - شیشه‌ای */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center gap-8 sm:gap-16">
            {/* آمار 1 */}
            <LiquidGlassCard
              draggable={false}
              blurIntensity="md"
              borderRadius="20px"
              glowIntensity="sm"
              className="px-6 py-3 text-center min-w-[100px]"
            >
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                100+
              </div>
              <div className="text-xs text-white/80">پروژه موفق</div>
            </LiquidGlassCard>

            {/* آمار 2 */}
            <LiquidGlassCard
              draggable={false}
              blurIntensity="md"
              borderRadius="20px"
              glowIntensity="sm"
              className="px-6 py-3 text-center min-w-[100px]"
            >
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
                ۲۴/۷
              </div>
              <div className="text-xs text-white/80">پشتیبانی حرفه‌ای</div>
            </LiquidGlassCard>

            {/* آمار 3 */}
            <LiquidGlassCard
              draggable={false}
              blurIntensity="md"
              borderRadius="20px"
              glowIntensity="sm"
              className="px-6 py-3 text-center min-w-[100px]"
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
