import api from './axios';

export const statsAPI = {
  getOverview: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/stats/overview", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getDaily: async (date: string) => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/stats/daily?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getPages: async () => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/stats/pages", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  trackView: async (data: { path: string }) => {
    const response = await api.post("/stats/view", data);
    return response.data;
  },
};
