// src/lib/api/upload.ts
import api from "./axios";

export const uploadAPI = {
  // ==========================================
  // 📤 POST /api/v1/upload/image
  // آپلود تصویر در پوشه دلخواه
  // ==========================================
  uploadImage: async (
    file: File,
    folder: string = "general",
  ): Promise<{
    filename: string;
    url: string;
    content_type: string;
    size: number;
  }> => {
    const token = localStorage.getItem("token") || "";

    // ✅ ساخت FormData
    const formData = new FormData();
    formData.append("file", file);

    // ✅ ارسال با پارامتر folder در query
    const response = await api.post("/upload/image", formData, {
      params: { folder }, // ← folder به عنوان query parameter
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      timeout: 60000, // 60 ثانیه برای فایل‌های بزرگ
    });

    return response.data;
  },

  // ==========================================
  // 📤 آپلود با FormData (برای کدهای موجود)
  // ==========================================
  uploadImageWithFormData: async (
    formData: FormData,
  ): Promise<{
    filename: string;
    url: string;
    content_type: string;
    size: number;
  }> => {
    const token = localStorage.getItem("token") || "";

    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      timeout: 60000,
    });

    return response.data;
  },

  // ==========================================
  // 📤 آپلود در پوشه avatars (برای پروفایل)
  // ==========================================
  uploadAvatar: async (file: File): Promise<string> => {
    const response = await uploadAPI.uploadImage(file, "avatars");
    return response.url;
  },

  // ==========================================
  // 📤 آپلود در پوشه hero (برای اسلایدها)
  // ==========================================
  uploadHeroImage: async (file: File): Promise<string> => {
    const response = await uploadAPI.uploadImage(file, "hero");
    return response.url;
  },

  // ==========================================
  // 📤 آپلود در پوشه products (برای محصولات)
  // ==========================================
  uploadProductImage: async (file: File): Promise<string> => {
    const response = await uploadAPI.uploadImage(file, "products");
    return response.url;
  },

  // ==========================================
  // 📤 آپلود در پوشه tickets (برای تیکت‌ها)
  // ==========================================
  uploadTicketImage: async (file: File): Promise<string> => {
    const response = await uploadAPI.uploadImage(file, "tickets");
    return response.url;
  },
};
// import api from './axios';

// export const uploadAPI = {
//   uploadImage: async (file: File, folder: string = 'hero') => {
//     const formData = new FormData();
//     formData.append('image', file);
//     if (folder) {
//       formData.append('folder', folder);
//     }

//     const response = await api.post('/upload/image', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       timeout: 60000,
//     });
//     return response.data;
//   },

//   uploadImageWithFormData: async (formData: FormData) => {
//     const response = await api.post('/upload/image', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       timeout: 60000,
//     });
//     return response.data;
//   },

//   uploadFile: async (file: File, folder: string = 'general') => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('folder', folder);

//     const response = await api.post('/upload/file', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },
// };
