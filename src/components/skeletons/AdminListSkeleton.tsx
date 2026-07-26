// src/components/skeletons/AdminListSkeleton.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

export function AdminListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/5 rounded mt-1 animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse flex-1" />
        <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
      </div>

      {/* List */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <LiquidGlassCard
            key={i}
            className="p-4"
            borderRadius="16px"
            blurIntensity="sm"
            glowIntensity="sm"
          >
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-12 h-12 bg-white/5 rounded-full animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-6 bg-white/5 rounded w-32 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-white/5 rounded w-16 animate-pulse" />
                    <div className="h-6 bg-white/5 rounded w-16 animate-pulse" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-4 bg-white/5 rounded w-24 animate-pulse" />
                  <div className="h-4 bg-white/5 rounded w-24 animate-pulse" />
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="h-10 w-10 bg-white/5 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  );
}
