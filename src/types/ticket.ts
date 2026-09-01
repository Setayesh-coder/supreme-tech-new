// src/types/ticket.ts
export interface Ticket {
  id: string;
  title: string;
  department?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
  status: "open" | "pending" | "answered" | "closed" | "in_progress";
  creator_id: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  members?: string[] | TicketMember[];
  messages?: TicketMessage[];
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message: string;
  is_admin?: boolean;
  attachments?: string[];
  created_at: string;
  updated_at?: string;
}

export interface TicketCreate {
  title: string;
  message: string;
  department?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
}

export interface TicketGroupCreate {
  title: string;
  message: string;
  user_ids: string[];
  department?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
}

export interface TicketMessageCreate {
  message: string;
  attachments?: string[];
}
