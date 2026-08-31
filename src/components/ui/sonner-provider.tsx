// src/components/ui/sonner-provider.tsx
import { Toaster } from "sonner";

export function SonnerProvider() {
  return (
    <Toaster
      position="bottom-right" // ✅ تغییر به پایین سمت راست
      richColors
      closeButton
      dir="rtl"
      toastOptions={{
        style: {
          background: "rgba(26, 26, 46, 0.85)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(255, 255, 255, 0.03)",
          padding: "16px 20px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          // ✅ موقعیت از پایین
          marginBottom: "20px",
          marginRight: "20px",
        },
        className: "glass-toast",
        duration: 4000,
      }}
    />
  );
}
