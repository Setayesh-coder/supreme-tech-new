// src/components/ui/Toaster.tsx
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { LiquidGlassCard } from "./LiquidGlassCard";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

// ✅ تابع نمایش Toast با LiquidGlassCard (همون قبلی)
export function showGlassToast({
  title,
  description,
  type = "default",
  action,
  duration = 4000,
  icon,
}: {
  title: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info" | "loading" | "default";
  action?: { label: string; onClick: () => void };
  duration?: number;
  icon?: ReactNode;
}) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    loading: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
    default: <Info className="w-5 h-5 text-gray-400" />,
  };

  const borderColors = {
    success: "border-green-500/30",
    error: "border-red-500/30",
    warning: "border-yellow-500/30",
    info: "border-blue-500/30",
    loading: "border-blue-500/30",
    default: "border-white/10",
  };

  const glowColors = {
    success: "shadow-green-500/10",
    error: "shadow-red-500/10",
    warning: "shadow-yellow-500/10",
    info: "shadow-blue-500/10",
    loading: "shadow-blue-500/10",
    default: "shadow-white/5",
  };

  const iconElement = icon || icons[type] || icons.default;

  sonnerToast.custom(
    (id) => (
      <LiquidGlassCard
        className={`p-4 min-w-[300px] max-w-[420px] ${borderColors[type]} ${glowColors[type]}`}
        borderRadius="16px"
        blurIntensity="xl"
        glowIntensity="sm"
        shadowIntensity="md"
      >
        <div className="flex items-start gap-3 relative">
          {/* آیکون */}
          <div className="flex-shrink-0 mt-0.5">{iconElement}</div>

          {/* محتوا */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            {description && (
              <p className="text-sm text-white/60 mt-1">{description}</p>
            )}
          </div>

          {/* دکمه بستن */}
          <button
            onClick={() => sonnerToast.dismiss(id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors -mt-1 -mr-1"
          >
            <X className="w-4 h-4 text-white/40 hover:text-white/70 transition-colors" />
          </button>
        </div>

        {/* Action دکمه */}
        {action && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <button
              onClick={() => {
                sonnerToast.dismiss(id);
                action.onClick();
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              {action.label}
            </button>
          </div>
        )}
      </LiquidGlassCard>
    ),
    { duration },
  );
}

// ✅ کامپوننت Toaster (همان نام قبلی)
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      dir="rtl"
      toastOptions={{
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "none",
          padding: "0",
        },
        className: "sonner-glass-wrapper",
        duration: 4000,
      }}
    />
  );
}

// ✅ export کردن toast برای استفاده راحت (همان API قبلی)
export const toast = sonnerToast;

// ✅ توابع کمکی با LiquidGlassCard (همان API قبلی)
export const glassToast = {
  show: showGlassToast,

  success: (title: string, description?: string, options?: any) => {
    showGlassToast({ title, description, type: "success", ...options });
  },

  error: (title: string, description?: string, options?: any) => {
    showGlassToast({ title, description, type: "error", ...options });
  },

  warning: (title: string, description?: string, options?: any) => {
    showGlassToast({ title, description, type: "warning", ...options });
  },

  info: (title: string, description?: string, options?: any) => {
    showGlassToast({ title, description, type: "info", ...options });
  },

  loading: (title: string, description?: string, options?: any) => {
    showGlassToast({
      title,
      description,
      type: "loading",
      duration: 1000000,
      ...options,
    });
  },
};
