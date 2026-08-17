import api from "./axios";

export const uploadAPI = {
  uploadImage: async (file: File, folder: string = "general") => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/upload/image", formData, {
      params: { folder },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  deleteFile: async (fileUrl: string) => {
    const response = await api.delete("/upload/file", {
      data: { file_url: fileUrl },
    });
    return response.data;
  },
};
// import api from "./axios";

// export const uploadAPI = {
//   // ==========================================
//   // 📤 POST /api/v1/upload/image
//   // آپلود تصویر در پوشه دلخواه
//   // ==========================================
//   uploadImage: async (
//     file: File,
//     folder: string = "general",
//   ): Promise<{
//     filename: string;
//     url: string;
//     content_type: string;
//     size: number;
//   }> => {
//     const token = localStorage.getItem("token") || "";

//     const formData = new FormData();
//     // ✅ اصلاح: استفاده از "file" به جای "image"
//     formData.append("file", file);
//     formData.append("folder", folder);

//     try {
//       const response = await api.post("/upload/image", formData, {
//         headers: {
//           // ❌ حذف: 'Content-Type': 'multipart/form-data'
//           Authorization: `Bearer ${token}`,
//         },
//         timeout: 60000,
//       });

//       return response.data;
//     } catch (error: any) {
//       console.error("❌ خطای آپلود:");
//       console.error("- وضعیت:", error.response?.status);
//       console.error("- داده:", error.response?.data);
//       throw error;
//     }
//   },

//   // ==========================================
//   // 📤 آپلود با FormData (برای کدهای موجود)
//   // ==========================================
//   uploadImageWithFormData: async (
//     formData: FormData,
//   ): Promise<{
//     filename: string;
//     url: string;
//     content_type: string;
//     size: number;
//   }> => {
//     const token = localStorage.getItem("token") || "";

//     // 🔍 دیباگ: نمایش محتویات FormData
//     console.log("📤 محتویات FormData:");
//     for (let pair of formData.entries()) {
//       if (pair[1] instanceof File) {
//         console.log(
//           `  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`,
//         );
//       } else {
//         console.log(`  ${pair[0]}: ${pair[1]}`);
//       }
//     }

//     try {
//       const response = await api.post("/upload/image", formData, {
//         headers: {
//           // ❌ حذف: 'Content-Type': 'multipart/form-data'
//           Authorization: `Bearer ${token}`,
//         },
//         timeout: 60000,
//       });

//       console.log("✅ پاسخ آپلود:", response.data);
//       return response.data;
//     } catch (error: any) {
//       console.error("❌ خطای آپلود با FormData:");
//       console.error("- وضعیت:", error.response?.status);
//       console.error("- داده:", error.response?.data);
//       throw error;
//     }
//   },

//   // ==========================================
//   // 📤 آپلود در پوشه blog (برای وبلاگ)
//   // ==========================================
//   uploadBlogImage: async (file: File): Promise<string> => {
//     const response = await uploadAPI.uploadImage(file, "blog");
//     return response.url;
//   },

//   // ==========================================
//   // 📤 آپلود در پوشه avatars (برای پروفایل)
//   // ==========================================
//   uploadAvatar: async (file: File): Promise<string> => {
//     const response = await uploadAPI.uploadImage(file, "avatars");
//     return response.url;
//   },

//   // ==========================================
//   // 📤 آپلود در پوشه hero (برای اسلایدها)
//   // ==========================================
//   uploadHeroImage: async (file: File): Promise<string> => {
//     const response = await uploadAPI.uploadImage(file, "hero");
//     return response.url;
//   },

//   // ==========================================
//   // 📤 آپلود در پوشه products (برای محصولات)
//   // ==========================================
//   uploadProductImage: async (file: File): Promise<string> => {
//     const response = await uploadAPI.uploadImage(file, "products");
//     return response.url;
//   },

//   // ==========================================
//   // 📤 آپلود در پوشه tickets (برای تیکت‌ها)
//   // ==========================================
//   uploadTicketImage: async (file: File): Promise<string> => {
//     const response = await uploadAPI.uploadImage(file, "tickets");
//     return response.url;
//   },
// };
