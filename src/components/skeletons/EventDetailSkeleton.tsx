// src/components/skeletons/EventDetailSkeleton.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

export function EventDetailSkeleton() {
  return (
    <section className="py-12 px-4 md:px-6 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        {/* Back button */}
        <div className="h-10 w-32 bg-white/5 rounded-full animate-pulse mb-6" />

        {/* Hero image */}
        <div className="h-64 md:h-[420px] bg-white/5 rounded-3xl animate-pulse mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Content */}
          <div className="lg:col-span-2">
            <LiquidGlassCard className="p-6 md:p-8" borderRadius="24px" blurIntensity="lg" glowIntensity="md">
              <div className="space-y-4">
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
          <div className="lg:sticky lg:top-6">
            <LiquidGlassCard className="p-6" borderRadius="24px" blurIntensity="lg" glowIntensity="md" shadowIntensity="lg">
              <div className="space-y-4">
                <div className="h-8 bg-white/5 rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-2 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-12 bg-white/5 rounded-xl w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-3/4 mx-auto animate-pulse" />
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}