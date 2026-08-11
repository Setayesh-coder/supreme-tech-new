// src/lib/api/upload.ts
import api from './axios';

export const uploadAPI = {
  uploadImage: async (file: File, folder: string = 'hero') => {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }
    
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
    return response.data;
  },

  uploadImageWithFormData: async (formData: FormData) => {
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
    return response.data;
  },

  uploadFile: async (file: File, folder: string = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
