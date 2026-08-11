import api from './axios';

export const blogAPI = {
  // دریافت همه پست‌ها - با پارامترهای object
  getAll: async (params?: { page?: number; limit?: number; search?: string; tag?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);
    if (params?.tag) query.append('tag', params.tag);
    
    const url = `/blog${query.toString() ? '?' + query.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get(`/blog/slug/${slug}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/blog/id/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/blog", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.put(`/blog/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.delete(`/blog/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getTags: async () => {
    const response = await api.get("/blog/tags");
    return response.data;
  },

  like: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(`/blog/${id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // ✅ اضافه کردن toggleLike
  toggleLike: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(`/blog/${id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getLikeStatus: async (id: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/blog/${id}/like-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};
