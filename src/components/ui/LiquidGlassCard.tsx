// src/components/ui/LiquidGlassCard.tsx
"use client";
import { cn } from "../../lib/utils";
import type React from "react";

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  blurIntensity?: "sm" | "md" | "lg" | "xl";
  shadowIntensity?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  borderRadius?: string;
  glowIntensity?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  hoverScale?: number | boolean;  // ← اضافه شد
}

export const LiquidGlassCard = ({
  children,
  className = "",
  blurIntensity = "xl",
  borderRadius = "32px",
  glowIntensity = "sm",
  shadowIntensity = "md",
  onClick,
  hoverScale = false,  // ← مقدار پیش‌فرض
  ...props
}: LiquidGlassCardProps) => {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  const shadowStyles = {
    none: "inset 0 0 0 0 rgba(255, 255, 255, 0)",
    xs: "inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3), inset -1px -1px 1px 0 rgba(255, 255, 255, 0.3)",
    sm: "inset 2px 2px 2px 0 rgba(255, 255, 255, 0.35), inset -2px -2px 2px 0 rgba(255, 255, 255, 0.35)",
    md: "inset 3px 3px 3px 0 rgba(255, 255, 255, 0.45), inset -3px -3px 3px 0 rgba(255, 255, 255, 0.45)",
    lg: "inset 4px 4px 4px 0 rgba(255, 255, 255, 0.5), inset -4px -4px 4px 0 rgba(255, 255, 255, 0.5)",
    xl: "inset 6px 6px 6px 0 rgba(255, 255, 255, 0.55), inset -6px -6px 6px 0 rgba(255, 255, 255, 0.55)",
    "2xl": "inset 8px 8px 8px 0 rgba(255, 255, 255, 0.6), inset -8px -8px 8px 0 rgba(255, 255, 255, 0.6)",
  };

  const glowStyles = {
    none: "0 4px 4px rgba(0, 0, 0, 0.05), 0 0 12px rgba(0, 0, 0, 0.05)",
    xs: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 16px rgba(255, 255, 255, 0.05)",
    sm: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 24px rgba(255, 255, 255, 0.1)",
    md: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 32px rgba(255, 255, 255, 0.15)",
    lg: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 40px rgba(255, 255, 255, 0.2)",
    xl: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 48px rgba(255, 255, 255, 0.25)",
    "2xl": "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 60px rgba(255, 255, 255, 0.3)",
  };

  // محاسبه hover scale
  const getHoverScale = () => {
    if (typeof hoverScale === 'number') return hoverScale;
    if (hoverScale === true) return 1.02;
    return 1;
  };

  const scale = getHoverScale();

  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-out",
        scale > 1 && "hover:scale-[1.02] active:scale-[0.98]",
        onClick && "cursor-pointer",
        className,
      )}
      style={{
        borderRadius,
      }}
      onClick={onClick}
      {...props}
    >
      {/* لایه‌های شیشه‌ای */}
      <div
        className={cn(
          "absolute inset-0 z-0 pointer-events-none transition-all duration-300",
          blurClasses[blurIntensity]
        )}
        style={{
          borderRadius,
        }}
      />

      <div
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-300"
        style={{
          borderRadius,
          boxShadow: glowStyles[glowIntensity],
        }}
      />

      <div
        className="absolute inset-0 z-20 pointer-events-none transition-all duration-300"
        style={{
          borderRadius,
          boxShadow: shadowStyles[shadowIntensity],
        }}
      />

      {/* محتوا */}
      <div className="relative z-30 pointer-events-auto">
        {children}
      </div>
    </div>
  );
};