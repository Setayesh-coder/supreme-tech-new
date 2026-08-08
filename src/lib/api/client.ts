// src/lib/api/client.ts

const API_URL = import.meta.env.VITE_API_URL || "https://supremetech.ir/api";

// ========== دریافت توکن ==========
const getToken = () => {
  const token = localStorage.getItem("token");
  console.log("🔑 getToken:", token ? "✅ دارد" : "❌ ندارد");
  if (token) {
    console.log("🔑 token (first 20 chars):", token.substring(0, 20) + "...");
  }
  return token;
};

// ========== ساخت هدر ==========
const getHeaders = (customToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = customToken || getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("🔑 هدر Authorization اضافه شد");
  } else {
    console.warn("⚠️ توکن وجود ندارد");
  }

  return headers;
};

// ========== مدیریت پاسخ ==========
const handleResponse = async (response: Response) => {
  console.log(`📥 پاسخ: ${response.status} ${response.statusText}`);
  
  let data;
  try {
    data = await response.json();
    console.log("📦 داده خام:", JSON.stringify(data).substring(0, 200) + "...");
  } catch {
    data = { error: "پاسخ نامعتبر" };
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    const error = new Error(data.error || data.message || "خطا");
    (error as any).status = response.status;
    throw error;
  }

  return data;
};

export const apiClient = {
  get: async (endpoint: string, customToken?: string) => {
    const url = `${API_URL}${endpoint}`;
    console.log("🌐 GET:", url);
    
    const response = await fetch(url, {
      headers: getHeaders(customToken),
    });
    return handleResponse(response);
  },

  post: async (endpoint: string, data: any, customToken?: string) => {
    const url = `${API_URL}${endpoint}`;
    console.log("🌐 POST:", url);
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(customToken),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (endpoint: string, data: any, customToken?: string) => {
    const url = `${API_URL}${endpoint}`;
    console.log("🌐 PUT:", url);
    const response = await fetch(url, {
      method: "PUT",
      headers: getHeaders(customToken),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  patch: async (endpoint: string, data: any, customToken?: string) => {
    const url = `${API_URL}${endpoint}`;
    console.log("🌐 PATCH:", url);
    const response = await fetch(url, {
      method: "PATCH",
      headers: getHeaders(customToken),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string, customToken?: string) => {
    const url = `${API_URL}${endpoint}`;
    console.log("🌐 DELETE:", url);
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(customToken),
    });
    return handleResponse(response);
  },
};
