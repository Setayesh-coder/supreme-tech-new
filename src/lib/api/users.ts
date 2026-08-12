import api from "./axios";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "USER" | "EMPLOYEE" | "ADMIN";
  isActive: boolean;
  province?: string;
  birthDate?: string;
  gender?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    tickets: number;
  };
}

export const usersAPI = {
  // ========== پروفایل کاربر ==========
  getMyProfile: async (): Promise<User> => {
    const response = await api.get("/users/me");
    return response.data;
  },

  updateMyProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch("/users/me", data);
    return response.data;
  },

  changeMyPassword: async (data: {
    current_password: string;
    new_password: string;
  }): Promise<{ message: string }> => {
    const response = await api.post("/users/me/change-password", data);
    return response.data;
  },

  // ========== مدیریت کاربران (ادمین) ==========
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    items: User[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateRole: async (
    id: string,
    role: "USER" | "EMPLOYEE" | "ADMIN",
  ): Promise<User> => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  toggleActive: async (id: string): Promise<User> => {
    const response = await api.patch(`/users/${id}/toggle-active`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
