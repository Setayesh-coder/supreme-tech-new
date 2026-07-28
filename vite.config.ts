import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80,
        compress: {
          format: "webp",
          quality: 80,
        },
      },
      jpeg: {
        quality: 80,
        compress: {
          format: "webp",
          quality: 80,
        },
      },
      jpg: {
        quality: 80,
        compress: {
          format: "webp",
          quality: 80,
        },
      },
      webp: {
        quality: 75,
      },
      svg: {
        quality: 100,
      },
      cache: true,
      include: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.webp", "**/*.svg"],
      exclude: ["**/node_modules/**", "**/dist/**"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: "esbuild",
    sourcemap: false,
    target: "es2015",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // جدا کردن کتابخانه‌های بزرگ
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "react-vendor";
            }
            if (id.includes("lucide-react")) {
              return "ui-vendor";
            }
            if (id.includes("axios")) {
              return "axios-vendor";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
  },
});
