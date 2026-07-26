// src/lib/api/client.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ========== تابع کمکی برای مدیریت پاسخ ==========
const handleResponse = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { error: "پاسخ نامعتبر از سرور" };
  }

  if (!response.ok) {
    const error = new Error(data.error || data.message || "خطا در درخواست");
    (error as any).status = response.status; // 🔥 اضافه کردن status به خطا
    (error as any).data = data;
    throw error;
  }

  if (data && data.data !== undefined) {
    return data.data;
  }

  return data;
};

export const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    return handleResponse(response);
  },

  post: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // 🔥 اضافه کنید
  patch: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse(response);
  },
};
