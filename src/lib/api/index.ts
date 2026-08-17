// src/lib/api/index.ts
export * from "./axios";
export * from "./blog";
export * from "./courses";
export * from "./events";
export * from "./hero";
export * from "./settings";
export * from "./upload";
export * from "./partners";
export * from "./team";
export * from "./employees";
export * from "./tickets";
export * from "./messages";
export * from "./enrollments";
export * from "./auth";
export * from "./stats";
export * from "./users";
export { generateSlug } from './courses';
// ✅ حل مشکل generateSlug - صادرات مجدد با نام مستعار
// اگر generateSlug در هر دو فایل blog و courses وجود دارد
// یکی را با نام مستعار صادر کنید
export { generateSlug as generateBlogSlug } from "./blog";
export { generateSlug as generateCourseSlug } from "./courses";
