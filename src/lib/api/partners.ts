// src/lib/api/partners.ts
export interface Partner {
  id: string;
  name: string;
  logo?: string;
  url?: string;
  order: number;
  isActive: boolean;
}

export const partnersAPI = {
  // دریافت همه همکاران فعال
  getAll: async (): Promise<Partner[]> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/partners?isActive=true`,
    );
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.json();
  },

  // دریافت یک همکار
  getById: async (id: string): Promise<Partner> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/partners/${id}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.json();
  },

  // ایجاد همکار جدید
  create: async (data: Omit<Partner, "id">): Promise<Partner> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/partners`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.json();
  },

  // ویرایش همکار
  update: async (id: string, data: Partial<Partner>): Promise<Partner> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/partners/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.json();
  },

  // حذف همکار
  delete: async (id: string): Promise<void> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/partners/${id}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
  },
};
