
import api from "./axios";

// ✅ تایپ کامل کارمند (برای مدیریت ادمین)
export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  national_id?: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  department?: string;
  position?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    managedEvents: number;
    tickets?: number;
  };
}

// ✅ تایپ عمومی کارمند (برای نمایش در سایت)
export interface EmployeePublic {
  id: string;
  name: string;
  department?: string;
  position?: string;
  avatar?: string;
  is_active?: boolean;  // ✅ اضافه شد
}

export const employeesAPI = {
  // 📥 دریافت لیست عمومی کارمندان (بدون احراز هویت)
  getPublic: async (): Promise<EmployeePublic[]> => {
    const response = await api.get("/employees/public");
    return response.data;
  },

  // 📥 دریافت جزئیات یک کارمند (نیاز به ادمین)
  getById: async (id: string): Promise<Employee> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 📤 ایجاد کارمند جدید (نیاز به ادمین)
  create: async (data: {
    phone: string;
    national_id: string;
    department?: string;
    position?: string;
    role?: "EMPLOYEE" | "MANAGER" | "ADMIN";
  }): Promise<Employee> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/employees", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 📤 ویرایش کارمند (نیاز به ادمین)
  update: async (
    id: string,
    data: {
      national_id?: string;
      role?: "EMPLOYEE" | "MANAGER" | "ADMIN";
      department?: string;
      position?: string;
      is_active?: boolean;
    }
  ): Promise<Employee> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.put(`/employees/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 🗑️ حذف کارمند (نیاز به ادمین)
  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await api.delete(`/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 🔐 لاگین کارمند
  login: (data: { phone: string; password: string }) => {
    return api.post("/employees/login", data);
  },

  // 📥 دریافت لیست کامل کارمندان (نیاز به ادمین)
  getAll: async (): Promise<Employee[]> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.get("/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("❌ خطا در دریافت کارمندان:", error);
      return [];
    }
  },
};
