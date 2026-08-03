// src/lib/api/employees.ts
import { apiClient } from "./client";

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  department?: string;
  position?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    managedEvents: number;
  };
}

// 🔥 داده‌های پیش‌فرض برای نمایش در صورت عدم دریافت از سرور
const fallbackEmployees: Employee[] = [
  {
    id: "1",
    name: "احمد رضایی",
    phone: "09123456789",
    email: "ahmad@supremetech.ir",
    role: "MANAGER",
    department: "توسعه نرم‌افزار",
    position: "مدیر فنی",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { managedEvents: 5 },
  },
  {
    id: "2",
    name: "سارا محمدی",
    phone: "09123456788",
    email: "sara@supremetech.ir",
    role: "EMPLOYEE",
    department: "طراحی UI/UX",
    position: "طراح ارشد",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { managedEvents: 3 },
  },
  {
    id: "3",
    name: "علی کریمی",
    phone: "09123456787",
    email: "ali@supremetech.ir",
    role: "EMPLOYEE",
    department: "هوش مصنوعی",
    position: "متخصص یادگیری ماشین",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { managedEvents: 2 },
  },
  {
    id: "4",
    name: "مریم حسینی",
    phone: "09123456786",
    email: "maryam@supremetech.ir",
    role: "EMPLOYEE",
    department: "بازاریابی",
    position: "مدیر بازاریابی دیجیتال",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { managedEvents: 1 },
  },
];

export const employeesAPI = {
  getAll: async (): Promise<Employee[]> => {
    try {
      console.log("📤 درخواست دریافت کارمندان...");

      // 🔥 ابتدا سعی کن از مسیر عمومی دریافت کنی
      const response = await apiClient.get("/employees/public");
      console.log("✅ کارمندان از مسیر عمومی دریافت شدند:", response);

      if (Array.isArray(response) && response.length > 0) {
        return response;
      }

      // اگر داده خالی بود، از fallback استفاده کن
      console.warn(
        "⚠️ داده‌ای از سرور دریافت نشد، استفاده از داده‌های پیش‌فرض",
      );
      return fallbackEmployees;
    } catch (error: any) {
      console.error("❌ خطا در دریافت کارمندان از مسیر عمومی:", error);

      // اگر خطای 401 بود یا هر خطای دیگری، از fallback استفاده کن
      if (error.status === 401) {
        console.warn("⚠️ دسترسی به لیست کارمندان نیاز به احراز هویت دارد");
      }

      // 🔥 همیشه در صورت خطا، داده‌های پیش‌فرض را برگردان
      console.log("📋 استفاده از داده‌های پیش‌فرض کارمندان");
      return fallbackEmployees;
    }
  },

  getById: async (id: string): Promise<Employee> => {
    try {
      const response = await apiClient.get(`/employees/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ خطا در دریافت کارمند با ID ${id}:`, error);
      // اگر خطا بود، اولین کارمند از fallback را برگردان
      return fallbackEmployees[0];
    }
  },

  create: async (data: any): Promise<Employee> => {
    try {
      const response = await apiClient.post("/employees", data);
      return response;
    } catch (error) {
      console.error("❌ خطا در ایجاد کارمند:", error);
      throw error;
    }
  },

  update: async (id: string, data: any): Promise<Employee> => {
    try {
      const response = await apiClient.put(`/employees/${id}`, data);
      return response;
    } catch (error) {
      console.error(`❌ خطا در بروزرسانی کارمند ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/employees/${id}`);
    } catch (error) {
      console.error(`❌ خطا در حذف کارمند ${id}:`, error);
      throw error;
    }
  },

  login: async (phone: string, password: string) => {
    const response = await apiClient.post("/employees/login", {
      phone,
      password,
    });
    return response;
  },
};
