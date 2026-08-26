// src/components/ui/LiquidToast.tsx
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import {
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { LiquidGlassCard } from "./LiquidGlassCard";

// ✅ انواع پیام
export type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

// ✅ آیکون‌های هر نوع
const getToastIcon = (variant: ToastVariant) => {
  switch (variant) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case "error":
      return <XCircle className="w-5 h-5 text-red-400" />;
    case "warning":
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    case "loading":
      return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    case "info":
      return <Info className="w-5 h-5 text-blue-400" />;
    default:
      return <Sparkles className="w-5 h-5 text-purple-400" />;
  }
};

// ✅ رنگ‌های ملایم برای هر نوع - خطوط و سایه‌های ملایم
const getToastColors = (variant: ToastVariant) => {
  switch (variant) {
    case "success":
      return "border-green-500/20 shadow-green-500/5";
    case "error":
      return "border-red-500/20 shadow-red-500/5";
    case "warning":
      return "border-yellow-500/20 shadow-yellow-500/5";
    case "loading":
      return "border-blue-500/20 shadow-blue-500/5";
    case "info":
      return "border-blue-500/20 shadow-blue-500/5";
    default:
      return "border-white/10 shadow-white/5";
  }
};

// ✅ رنگ‌های ملایم برای خط کناری (یک نوار نازک)
const getAccentColor = (variant: ToastVariant) => {
  switch (variant) {
    case "success":
      return "bg-gradient-to-b from-green-400/40 to-green-500/40";
    case "error":
      return "bg-gradient-to-b from-red-400/40 to-red-500/40";
    case "warning":
      return "bg-gradient-to-b from-yellow-400/40 to-yellow-500/40";
    case "loading":
      return "bg-gradient-to-b from-blue-400/40 to-blue-500/40";
    case "info":
      return "bg-gradient-to-b from-blue-400/40 to-blue-500/40";
    default:
      return "bg-gradient-to-b from-purple-400/40 to-blue-500/40";
  }
};

// ✅ رنگ‌های ملایم برای نوار پیشرفت
const getProgressColor = (variant: ToastVariant) => {
  switch (variant) {
    case "success":
      return "bg-gradient-to-r from-green-400/50 to-green-500/50";
    case "error":
      return "bg-gradient-to-r from-red-400/50 to-red-500/50";
    case "warning":
      return "bg-gradient-to-r from-yellow-400/50 to-yellow-500/50";
    case "loading":
      return "bg-gradient-to-r from-blue-400/50 to-blue-500/50";
    case "info":
      return "bg-gradient-to-r from-blue-400/50 to-blue-500/50";
    default:
      return "bg-gradient-to-r from-purple-400/50 to-blue-500/50";
  }
};

// ✅ افکت درخشش برای هر نوع
const getGlowColor = (variant: ToastVariant) => {
  switch (variant) {
    case "success":
      return "shadow-green-500/20";
    case "error":
      return "shadow-red-500/20";
    case "warning":
      return "shadow-yellow-500/20";
    case "loading":
      return "shadow-blue-500/20";
    case "info":
      return "shadow-blue-500/20";
    default:
      return "shadow-white/10";
  }
};

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// ✅ Toast با LiquidGlass - طراحی مینیمال و شیشه‌ای
const ToastRoot = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: ToastVariant;
  }
>(({ className, variant = "default", ...props }, ref) => {
  const icon = getToastIcon(variant);
  const colors = getToastColors(variant);
  const accentColor = getAccentColor(variant);
  const progressColor = getProgressColor(variant);
  const glowColor = getGlowColor(variant);

  return (
    <ToastPrimitives.Root ref={ref} {...props}>
      <LiquidGlassCard
        className={cn(
          "relative overflow-hidden p-4 border transition-all duration-300 shadow-2xl",
          colors,
          glowColor,
          className,
        )}
        borderRadius="16px"
        blurIntensity="xl"
        glowIntensity="sm"
        shadowIntensity="md"
      >
        {/* ✅ خط رنگی نازک در کنار (بسیار ملایم) */}
        <div
          className={`absolute top-2 right-0 w-1 h-[calc(100%-16px)] rounded-full ${accentColor}`}
        />

        {/* ✅ دکوراسیون شیشه‌ای (بسیار ملایم) */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-white/5 rounded-full blur-3xl" />

        <div className="flex items-start gap-3 relative z-10">
          {/* ✅ آیکون */}
          <div className="flex-shrink-0 mt-0.5">{icon}</div>

          {/* ✅ محتوا */}
          <div className="flex-1 min-w-0">{props.children}</div>
        </div>

        {/* ✅ نوار پیشرفت ملایم */}
        {variant !== "loading" && (
          <div className="absolute bottom-0 right-0 left-0 h-[2px] bg-white/5 overflow-hidden">
            <div
              className={`h-full ${progressColor} animate-progress`}
              style={{
                animationDuration: "4s",
                animationTimingFunction: "linear",
                animationFillMode: "forwards",
              }}
            />
          </div>
        )}
      </LiquidGlassCard>
    </ToastPrimitives.Root>
  );
});
ToastRoot.displayName = ToastPrimitives.Root.displayName;

// ✅ Toast اصلی
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: ToastVariant;
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <ToastRoot ref={ref} className={className} variant={variant} {...props} />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

// ✅ Action دکمه
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

// ✅ دکمه بستن
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute top-2 right-2 rounded-lg p-1 text-white/30 transition-all duration-200 hover:text-white hover:bg-white/10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

// ✅ عنوان
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-white/90", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

// ✅ توضیحات
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-white/60", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// ✅ Types
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
