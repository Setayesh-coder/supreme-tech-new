// src/lib/api/tickets.ts
import api from './axios';

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  department?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "PENDING" | "ANSWERED" | "CLOSED";
  creator_id: string;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
  members?: string[];
}

export const ticketsAPI = {
  getAll: async (): Promise<Ticket[]> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/tickets", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getMyTickets: async (): Promise<Ticket[]> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/tickets/my", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getById: async (id: string): Promise<Ticket> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (data: {
    title: string;
    message: string;
    department?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  }): Promise<Ticket> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/tickets", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createGroup: async (data: {
    title: string;
    message: string;
    department?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    members: string[];
  }): Promise<Ticket> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/tickets/group", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  addMessage: async (ticketId: string, message: string): Promise<TicketMessage> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(`/tickets/${ticketId}/message`, { message }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateStatus: async (ticketId: string, status: "OPEN" | "PENDING" | "ANSWERED" | "CLOSED"): Promise<Ticket> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(`/tickets/${ticketId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    await api.delete(`/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};
