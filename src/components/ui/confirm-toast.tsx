// src/components/ui/confirm-toast.tsx
import { toast } from "sonner";
import { LiquidGlassCard } from "./LiquidGlassCard";
import { AlertTriangle, X, Check } from "lucide-react";

interface ConfirmToastProps {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function showConfirmToast({
  title,
  description,
  confirmText = "تایید",
  cancelText = "انصراف",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmToastProps) {
  const variantColors = {
    danger: {
      border: "border-red-500/30",
      button: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/20",
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
    },
    warning: {
      border: "border-yellow-500/30",
      button: "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/20",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    },
    info: {
      border: "border-blue-500/30",
      button: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/20",
      icon: <AlertTriangle className="w-5 h-5 text-blue-400" />,
    },
  };

  const colors = variantColors[variant];

  toast.custom(
    (id) => (
      <LiquidGlassCard
        className={`p-5 min-w-[340px] max-w-[440px] ${colors.border}`}
        borderRadius="16px"
        blurIntensity="xl"
        glowIntensity="sm"
        shadowIntensity="md"
      >
        <div className="flex items-start gap-3">
          {/* آیکون */}
          <div className="flex-shrink-0 mt-0.5">{colors.icon}</div>

          {/* محتوا */}
          <div className="flex-1">
            <h4 className="text-base font-semibold text-white">{title}</h4>
            {description && (
              <p className="text-sm text-white/60 mt-1">{description}</p>
            )}
          </div>

          {/* دکمه بستن */}
          <button
            onClick={() => toast.dismiss(id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/40 hover:text-white/70 transition-colors" />
          </button>
        </div>

        {/* دکمه‌ها */}
        <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
          <button
            onClick={async () => {
              try {
                await onConfirm();
                toast.dismiss(id);
              } catch (error) {
                toast.error("خطا در اجرای عملیات");
              }
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium ${colors.button} border transition-all duration-200 hover:scale-[1.02]`}
          >
            <Check className="w-4 h-4 inline ml-1" />
            {confirmText}
          </button>
          <button
            onClick={() => {
              if (onCancel) onCancel();
              toast.dismiss(id);
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all duration-200"
          >
            {cancelText}
          </button>
        </div>
      </LiquidGlassCard>
    ),
    { duration: 1000000 }, // تا زمانی که کاربر پاسخ نده باقی بمونه
  );
}