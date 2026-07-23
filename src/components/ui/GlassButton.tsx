import { type ReactNode, type ButtonHTMLAttributes } from "react";
// import { LiquidGlassCard } from "./LiquidGlassCard";
import { cn } from "../../lib/utils";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  variant?:
    | "primary"
    | "secondary"
    | "white"
    | "success"
    | "danger"
    | "warning";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  iconClassName?: string;
  loading?: boolean;
}

export function GlassButton({
  children,
  icon,
  iconPosition = "right",
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  iconClassName,
  loading = false,
  disabled,
  onClick,
  ...props
}: GlassButtonProps) {
  // ========== اندازه‌ها ==========
  const sizeClasses = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-10 py-4 text-lg",
  };

  // ========== رنگ‌ها ==========
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-500/80 to-blue-600/80 border border-blue-400/30 text-white hover:from-blue-600/80 hover:to-blue-700/80",
    secondary:
      "bg-gradient-to-r from-purple-500/80 to-purple-600/80 border border-purple-400/30 text-white hover:from-purple-600/80 hover:to-purple-700/80",
    white:
      "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
    success:
      "bg-gradient-to-r from-green-500/80 to-green-600/80 border border-green-400/30 text-white hover:from-green-600/80 hover:to-green-700/80",
    danger:
      "bg-gradient-to-r from-red-500/80 to-red-600/80 border border-red-400/30 text-white hover:from-red-600/80 hover:to-red-700/80",
    warning:
      "bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 border border-yellow-400/30 text-white hover:from-yellow-600/80 hover:to-yellow-700/80",
  };

  // ========== حالت‌ها ==========
  const isDisabled = disabled || loading;
  const disabledClasses = isDisabled
    ? "opacity-50 cursor-not-allowed hover:scale-100"
    : "";

  return (
    // <LiquidGlassCard
    //   // draggable={false}
    //   blurIntensity="lg"
    //   borderRadius="16px"
    //   glowIntensity="sm"
    //   className={cn(
    //     "overflow-hidden group cursor-pointer transition-all duration-300",
    //     !isDisabled && "hover:scale-105",
    //     fullWidth && "w-full",
    //     className,
    //   )}
    // >
    <button
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      className={cn(
        "font-bold flex items-center gap-2 justify-center backdrop-blur-sm",
        "transition-all duration-300",
        "rounded-xl",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        disabledClasses,
        className,
      )}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span
              className={cn(
                "group-hover:rotate-12 transition-transform",
                iconClassName,
              )}
            >
              {icon}
            </span>
          )}

          {children}

          {icon && iconPosition === "right" && (
            <span
              className={cn(
                "group-hover:rotate-12 transition-transform",
                iconClassName,
              )}
            >
              {icon}
            </span>
          )}
        </>
      )}
    </button>
    // </LiquidGlassCard>
  );
}
