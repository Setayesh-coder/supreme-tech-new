// src/components/ui/LoadingSkeleton.tsx
import React from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <LiquidGlassCard
          key={index}
          className="p-4 animate-pulse"
          borderRadius="14px"
          blurIntensity="sm"
          glowIntensity="sm"
        >
          <div className="flex gap-4">
            <div className="w-24 h-16 rounded-lg bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
              <div className="h-3 bg-white/5 rounded w-1/4" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5" />
          </div>
        </LiquidGlassCard>
      ))}
    </div>
  );
};
