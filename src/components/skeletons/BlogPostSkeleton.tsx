// src/components/skeletons/BlogPostSkeleton.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

export function BlogPostSkeleton() {
  return (
    <section className="py-12 px-4 md:px-6 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        {/* Back button */}
        <div className="h-10 w-32 bg-white/5 rounded-full animate-pulse mb-6" />

        {/* Hero */}
        <div className="h-64 md:h-96 bg-white/5 rounded-3xl animate-pulse mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Content */}
          <div className="lg:col-span-2">
            <LiquidGlassCard
              className="p-6 md:p-8"
              borderRadius="24px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-4 bg-white/5 rounded w-1/4 animate-pulse" />
                  <div className="h-4 bg-white/5 rounded w-1/4 animate-pulse" />
                </div>
                <div className="h-10 bg-white/5 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-4/5 animate-pulse" />
              </div>
            </LiquidGlassCard>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-6 space-y-6">
            <LiquidGlassCard
              className="p-5"
              borderRadius="20px"
              blurIntensity="lg"
              glowIntensity="sm"
            >
              <div className="space-y-3">
                <div className="h-5 bg-white/5 rounded w-1/2 animate-pulse" />
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-white/5 rounded w-3/4 animate-pulse"
                  />
                ))}
              </div>
            </LiquidGlassCard>
            <LiquidGlassCard
              className="p-5"
              borderRadius="20px"
              blurIntensity="lg"
              glowIntensity="sm"
            >
              <div className="space-y-3">
                <div className="h-5 bg-white/5 rounded w-1/2 animate-pulse" />
                <div className="flex gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-10 bg-white/5 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
