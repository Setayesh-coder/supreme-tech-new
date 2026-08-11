// // src/lib/api/client.ts

// // 🔥 استفاده مستقیم و قطعی از HTTPS
// const API_URL = "https://supremetech.ir/api/v1";

// console.log("🌐 API Base URL (client):", API_URL);

// const getToken = () => {
//   return localStorage.getItem("token");
// };

// const getHeaders = (customToken?: string): HeadersInit => {
//   const headers: HeadersInit = {
//     "Content-Type": "application/json",
//   };
//   const token = customToken || getToken();
//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }
//   return headers;
// };

// const handleResponse = async (response: Response) => {
//   let data;
//   try {
//     data = await response.json();
//   } catch {
//     data = { error: "پاسخ نامعتبر" };
//   }

//   if (!response.ok) {
//     if (response.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       localStorage.removeItem("admin");
//       localStorage.removeItem("employee");
//       if (!window.location.pathname.includes("/admin/login")) {
//         window.location.href = "/admin/login";
//       }
//     }
//     const error = new Error(data.error || data.message || "خطا");
//     (error as any).status = response.status;
//     throw error;
//   }

//   return data;
// };

// export const apiClient = {
//   get: async (endpoint: string, customToken?: string) => {
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       headers: getHeaders(customToken),
//     });
//     return handleResponse(response);
//   },

//   post: async (endpoint: string, data: any, customToken?: string) => {
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       method: "POST",
//       headers: getHeaders(customToken),
//       body: JSON.stringify(data),
//     });
//     return handleResponse(response);
//   },

//   put: async (endpoint: string, data: any, customToken?: string) => {
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       method: "PUT",
//       headers: getHeaders(customToken),
//       body: JSON.stringify(data),
//     });
//     return handleResponse(response);
//   },

//   patch: async (endpoint: string, data: any, customToken?: string) => {
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       method: "PATCH",
//       headers: getHeaders(customToken),
//       body: JSON.stringify(data),
//     });
//     return handleResponse(response);
//   },

//   delete: async (endpoint: string, customToken?: string) => {
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       method: "DELETE",
//       headers: getHeaders(customToken),
//     });
//     return handleResponse(response);
//   },
// };
