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

export const employeesAPI = {
  getAll: async (): Promise<Employee[]> => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get("/employees", token);
    return response;
  },

  getById: async (id: string): Promise<Employee> => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.get(`/employees/${id}`, token);
    return response;
  },

  create: async (data: any): Promise<Employee> => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.post("/employees", data, token);
    return response;
  },

  update: async (id: string, data: any): Promise<Employee> => {
    const token = localStorage.getItem("token") || "";
    const response = await apiClient.put(`/employees/${id}`, data, token);
    return response;
  },

  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await apiClient.delete(`/employees/${id}`, token);
  },

  login: async (phone: string, password: string) => {
    const response = await apiClient.post("/employees/login", {
      phone,
      password,
    });
    return response;
  },
};
