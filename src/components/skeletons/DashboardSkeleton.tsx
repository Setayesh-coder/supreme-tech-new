// src/components/skeletons/DashboardSkeleton.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-32 bg-white/5 rounded mt-1 animate-pulse" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <LiquidGlassCard
            key={i}
            className="p-4"
            borderRadius="16px"
            blurIntensity="sm"
            glowIntensity="sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-white/5 rounded w-20 animate-pulse" />
                <div className="h-8 bg-white/5 rounded w-16 animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-12 animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-white/5 rounded-lg animate-pulse" />
            </div>
          </LiquidGlassCard>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {[...Array(2)].map((_, i) => (
          <LiquidGlassCard
            key={i}
            className="p-4"
            borderRadius="16px"
            blurIntensity="sm"
            glowIntensity="sm"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-white/5 rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  );
}
