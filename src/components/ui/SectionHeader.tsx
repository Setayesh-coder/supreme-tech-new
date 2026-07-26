// src/components/ui/SectionHeader.tsx
import { LiquidGlassCard } from "./LiquidGlassCard";
import { ReactNode } from "react";

interface SectionHeaderProps {
  badge?: string;
  badgeIcon?: ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export default function SectionHeader({
  badge,
  badgeIcon,
  title,
  subtitle,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      {badge && (
        <div className="flex justify-center mb-6 pt-10">
          <LiquidGlassCard
            blurIntensity="md"
            borderRadius="100px"
            glowIntensity="sm"
            className="inline-flex px-4 py-2"
          >
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              {badgeIcon}
              {badge}
            </span>
          </LiquidGlassCard>
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          {title}
        </span>
      </h1>

      {subtitle && (
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
          {subtitle}
        </p>
      )}

      {description && (
        <p className="text-gray-500 max-w-2xl mx-auto text-sm">{description}</p>
      )}
    </div>
  );
}
