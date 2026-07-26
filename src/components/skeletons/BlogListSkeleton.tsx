// src/components/skeletons/BlogListSkeleton.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

export function BlogListSkeleton() {
  return (
    <section className="py-12 px-4 md:px-6 min-h-screen">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-8 w-40 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="h-10 w-64 bg-white/5 rounded-lg mx-auto animate-pulse" />
          <div className="h-4 w-96 bg-white/5 rounded mx-auto mt-2 animate-pulse" />
        </div>

        {/* Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LiquidGlassCard
              key={i}
              className="p-4"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
            >
              <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
              <div className="mt-4 space-y-3">
                <div className="flex gap-4">
                  <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse" />
                  <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse" />
                </div>
                <div className="h-6 bg-white/5 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 bg-white/5 rounded w-1/4 animate-pulse" />
                  <div className="h-4 bg-white/5 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
