// // تنظیمات مرکزی برنامه
// export const BASE_URL = import.meta.env.VITE_BASE_URL || "https://supremetech.ir";
// export const API_URL = import.meta.env.VITE_API_URL || "/api";
// export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || `${BASE_URL}/uploads`;

// // تابع کمکی برای ساخت آدرس کامل تصویر
// export const getImageUrl = (path?: string): string | null => {
//   if (!path) return null;

//   // اگر قبلاً کامل است
//   if (path.startsWith("http://") || path.startsWith("https://")) {
//     return path;
//   }

//   // اگر با / شروع می‌شود
//   if (path.startsWith("/")) {
//     return `${BASE_URL}${path}`;
//   }

//   // در غیر این صورت
//   return `${BASE_URL}/${path}`;
// };// src/lib/constants.ts
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://supremetech.ir/api/v1";
export const STATIC_URL =
  import.meta.env.VITE_STATIC_URL || "https://supremetech.ir";

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${STATIC_URL}${url}`;
  }
  return `${STATIC_URL}/${url}`;
};
