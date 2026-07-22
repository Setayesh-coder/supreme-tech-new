// src/lib/api/upload.ts
import api from "./axios";

export const uploadAPI = {
  uploadImage: async (formData: FormData) => {
    console.log("📤 ارسال درخواست آپلود...");

    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ پاسخ آپلود:", response.data);
    return response.data;
  },
};
