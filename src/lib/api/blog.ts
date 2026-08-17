import api from "./axios";

// ============================================
// 📋 تایپ‌ها بر اساس Schemas بک‌اند
// ============================================

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  cover_image: string | null;
  author_name: string;
  tags: string[];
  views_count: number;
  likes_count: number;
  published: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface BlogPostCreate {
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  cover_image?: string | null;
  author_name?: string;
  tags?: string[];
  published?: boolean;
}

export interface BlogPostUpdate {
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  content?: string | null;
  cover_image?: string | null;
  author_name?: string | null;
  tags?: string[] | null;
  published?: boolean | null;
}

export interface BlogPaginatedResponse {
  items: BlogPost[];
  total: number;
  page: number;
  limit: number;
}

export interface LikeStatusResponse {
  is_liked: boolean;
  likes_count: number;
}

// ✅ اصلاح: تطابق با LikeStatusResponseSchema
export interface LikeToggleResponse {
  is_liked: boolean;
  likes_count: number;
}

// ============================================
// 🛠️ توابع کمکی
// ============================================

/**
 * تولید slug از عنوان
 */
export const generateSlug = (title: string): string => {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-") // فاصله به خط تیره
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "") // حذف کاراکترهای خاص
    .replace(/-+/g, "-") // حذف خط تیره‌های تکراری
    .replace(/^-|-$/g, ""); // حذف خط تیره از ابتدا و انتها
};

// ============================================
// 📡 API functions
// ============================================

export const blogAPI = {
  /**
   * 📥 دریافت لیست پست‌ها (عمومی)
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
  }): Promise<BlogPaginatedResponse> => {
    const query = new URLSearchParams();

    if (params?.page && params.page > 0) {
      query.append("page", String(params.page));
    }
    if (params?.limit && params.limit > 0 && params.limit <= 100) {
      query.append("limit", String(params.limit));
    }
    if (params?.search && params.search.trim()) {
      query.append("search", params.search.trim());
    }
    if (params?.tag && params.tag.trim()) {
      query.append("tag", params.tag.trim());
    }

    const url = `/blog${query.toString() ? "?" + query.toString() : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * 📥 دریافت پست بر اساس slug (عمومی)
   */
  getBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await api.get(`/blog/slug/${slug}`);
    return response.data;
  },

  /**
   * 📥 دریافت پست بر اساس ID (فقط ادمین)
   */
  getById: async (id: string): Promise<BlogPost> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/blog/id/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * 📤 ایجاد پست جدید (فقط ادمین)
   */
  create: async (data: BlogPostCreate): Promise<BlogPost> => {
    const token = localStorage.getItem("token") || "";

    const payload = {
      title: data.title,
      slug: data.slug || generateSlug(data.title), // ✅ تولید خودکار slug
      summary: data.summary || null,
      content: data.content,
      cover_image: data.cover_image || null,
      author_name: data.author_name || "تیم سپریم تک",
      tags: data.tags || [],
      published: data.published !== undefined ? data.published : true,
    };

    const response = await api.post("/blog", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * 📤 ویرایش پست (فقط ادمین)
   */
  update: async (id: string, data: BlogPostUpdate): Promise<BlogPost> => {
    const token = localStorage.getItem("token") || "";

    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.summary !== undefined) payload.summary = data.summary;
    if (data.content !== undefined) payload.content = data.content;
    if (data.cover_image !== undefined) payload.cover_image = data.cover_image;
    if (data.author_name !== undefined) payload.author_name = data.author_name;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.published !== undefined) payload.published = data.published;

    const response = await api.put(`/blog/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * 🗑️ حذف پست (فقط ادمین)
   */
  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await api.delete(`/blog/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * 📥 دریافت تگ‌ها (عمومی)
   */
  getTags: async (): Promise<{ id: string; name: string; slug: string }[]> => {
    const response = await api.get("/blog/tags");
    return response.data;
  },

  /**
   * ❤️ لایک/آنلایک کردن (نیازمند لاگین)
   * ✅ اصلاح: تطابق با LikeStatusResponseSchema
   */
  toggleLike: async (id: string): Promise<LikeToggleResponse> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(
      `/blog/${id}/like`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  /**
   * 📥 دریافت وضعیت لایک کاربر (نیازمند لاگین)
   */
  getLikeStatus: async (id: string): Promise<LikeStatusResponse> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/blog/${id}/like-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
