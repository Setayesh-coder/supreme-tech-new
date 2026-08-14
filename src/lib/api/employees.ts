// src/lib/api/employees.ts
import api from "./axios";

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
  createdAt: string;
  updatedAt: string;
  _count?: {
    managedEvents: number;
    tickets?: number;
  };
}

export const employeesAPI = {
  getPublic: async () => {
    const response = await api.get("/employees/public");
    return response.data;
  },

  login: (data: { phone: string; password: string }) => {
    return api.post("/employees/login", data);
  },

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

  getById: async (id: string): Promise<Employee> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  create: async (data: Partial<Employee>): Promise<Employee> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/employees", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.put(`/employees/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await api.delete(`/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
