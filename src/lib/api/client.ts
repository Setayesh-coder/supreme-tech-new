// src/lib/api/client.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ========== دریافت توکن ==========
const getToken = () => {
  return localStorage.getItem("token");
};

// ========== ساخت هدر ==========
const getHeaders = (customToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = customToken || getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// ========== تابع کمکی برای مدیریت پاسخ ==========
const handleResponse = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { error: "پاسخ نامعتبر از سرور" };
  }

  if (!response.ok) {
    // 🔥 اگر خطای 401 بود و توکن داشتیم، توکن را پاک کن
    if (response.status === 401 && getToken()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // فقط در صورتی که در صفحه لاگین نیستیم
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/admin/login")
      ) {
        window.location.href = "/login";
      }
    }

    const error = new Error(data.error || data.message || "خطا در درخواست");
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data.data !== undefined ? data.data : data;
};

export const apiClient = {
  get: async (endpoint: string, customToken?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders(customToken),
    });
    return handleResponse(response);
  },

  post: async (endpoint: string, data: any, customToken?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(customToken),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (endpoint: string, data: any, customToken?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(customToken),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  patch: async (endpoint: string, data: any, customToken?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(customToken),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string, customToken?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(customToken),
    });
    return handleResponse(response);
  },
};
