// src/lib/api/tickets.ts
import api from "./axios";
import { usersAPI } from "./users";
import type {
  Ticket,
  TicketCreate,
  TicketGroupCreate,
  TicketMessage,
  TicketMessageCreate,
} from "../../types/ticket";

// ✅ کش برای ذخیره اطلاعات کاربران
const userCache = new Map<
  string,
  { name: string; email: string; phone?: string }
>();

// ✅ تابع کمکی برای دریافت اطلاعات کاربر با کش
const getUserInfo = async (userId: string) => {
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }
  try {
    const user = await usersAPI.getById(userId);
    const userInfo = {
      name: user.name || "کاربر ناشناس",
      email: user.email || "",
      phone: user.phone || "",
    };
    userCache.set(userId, userInfo);
    return userInfo;
  } catch (error) {
    console.error(`❌ خطا در دریافت کاربر ${userId}:`, error);
    const fallbackName = `کاربر ${userId.slice(0, 8)}`;
    const fallbackInfo = { name: fallbackName, email: "" };
    userCache.set(userId, fallbackInfo);
    return fallbackInfo;
  }
};

// ✅ تابع کمکی برای غنی‌سازی تیکت با اطلاعات کاربر
const enrichTicketWithUser = async (ticket: Ticket): Promise<Ticket> => {
  if (ticket.creator_id && !ticket.creator) {
    const userInfo = await getUserInfo(ticket.creator_id);
    ticket.creator = {
      id: ticket.creator_id,
      name: userInfo.name,
      email: userInfo.email,
      // phone: userInfo.phone,
    };
  }
  return ticket;
};

// ✅ تابع کمکی برای غنی‌سازی پیام‌ها با اطلاعات کاربر
const enrichMessagesWithUser = async (
  messages: TicketMessage[],
): Promise<TicketMessage[]> => {
  if (!messages || messages.length === 0) return messages;

  return await Promise.all(
    messages.map(async (msg) => {
      if (msg.user_id && !msg.user) {
        const userInfo = await getUserInfo(msg.user_id);
        msg.user = {
          id: msg.user_id,
          name: userInfo.name,
          email: userInfo.email,
        };
      }
      return msg;
    }),
  );
};

export const ticketsAPI = {
  /**
   * 📋 دریافت لیست تمام تیکت‌ها (ادمین)
   */
  getAll: async (params?: {
    status?: string;
    priority?: string;
  }): Promise<Ticket[]> => {
    try {
      const response = await api.get("/tickets", { params });
      console.log("📋 لیست تیکت‌ها دریافت شد:", response.data);

      const tickets = Array.isArray(response.data) ? response.data : [];
      const enrichedTickets = await Promise.all(
        tickets.map(enrichTicketWithUser),
      );

      return enrichedTickets;
    } catch (error) {
      console.error("❌ خطا در دریافت تیکت‌ها:", error);
      throw error;
    }
  },

  /**
   * 📋 دریافت تیکت‌های من (کاربر عادی)
   */
  getMyTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get("/tickets/my");
      const tickets = Array.isArray(response.data) ? response.data : [];
      return await Promise.all(tickets.map(enrichTicketWithUser));
    } catch (error) {
      console.error("❌ خطا در دریافت تیکت‌های من:", error);
      throw error;
    }
  },

  /**
   * ➕ ایجاد تیکت جدید
   */
  // src/lib/api/tickets.ts

  // ✅ اصلاح: اضافه کردن فیلدهای مورد نیاز بک‌اند
  create: async (data: TicketCreate): Promise<Ticket> => {
    try {
      // ✅ اطمینان از ارسال فیلدهای صحیح
      const payload = {
        title: data.title,
        message: data.message, // ✅ بک‌اند message می‌خواد
        department: data.department || "general",
        priority: data.priority || "MEDIUM",
        // اگر بک‌اند userId می‌خواد:
        // userId: data.userId || localStorage.getItem('userId'),
      };

      const response = await api.post("/tickets", payload);
      console.log("✅ تیکت جدید ایجاد شد:", response.data);
      return await enrichTicketWithUser(response.data);
    } catch (error) {
      console.error("❌ خطا در ایجاد تیکت:", error);
      throw error;
    }
  },
  /**
   * 👥 ایجاد تیکت گروهی (ادمین)
   */
  createGroup: async (data: TicketGroupCreate): Promise<Ticket> => {
    try {
      const response = await api.post("/tickets/group", data);
      console.log("✅ تیکت گروهی ایجاد شد:", response.data);
      return await enrichTicketWithUser(response.data);
    } catch (error) {
      console.error("❌ خطا در ایجاد تیکت گروهی:", error);
      throw error;
    }
  },

  /**
   * 📄 دریافت جزئیات یک تیکت
   */
  getById: async (id: string): Promise<Ticket> => {
    try {
      const response = await api.get(`/tickets/${id}`);
      const ticket = response.data;

      await enrichTicketWithUser(ticket);

      if (ticket.messages && ticket.messages.length > 0) {
        ticket.messages = await enrichMessagesWithUser(ticket.messages);
      }

      return ticket;
    } catch (error) {
      console.error(`❌ خطا در دریافت تیکت ${id}:`, error);
      throw error;
    }
  },

  /**
   * 💬 ارسال پیام روی تیکت
   */
  sendMessage: async (
    id: string,
    data: TicketMessageCreate,
  ): Promise<TicketMessage> => {
    try {
      const response = await api.post(`/tickets/${id}/message`, data);
      console.log(`✅ پیام به تیکت ${id} ارسال شد`);

      const message = response.data;

      // ✅ دریافت اطلاعات کاربر برای پیام
      if (message.user_id && !message.user) {
        const userInfo = await getUserInfo(message.user_id);
        message.user = {
          id: message.user_id,
          name: userInfo.name,
          email: userInfo.email,
        };
      }

      return message;
    } catch (error) {
      console.error(`❌ خطا در ارسال پیام به تیکت ${id}:`, error);
      throw error;
    }
  },

  /**
   * 🔄 تغییر وضعیت تیکت
   */
  updateStatus: async (
    id: string,
    status: "OPEN" | "IN_PROGRESS" | "WAITING" | "CLOSED",
  ): Promise<Ticket> => {
    try {
      const response = await api.patch(`/tickets/${id}/status`, { status });
      console.log(`✅ وضعیت تیکت ${id} به ${status} تغییر کرد`);
      return await enrichTicketWithUser(response.data);
    } catch (error) {
      console.error(`❌ خطا در تغییر وضعیت تیکت ${id}:`, error);
      throw error;
    }
  },

  /**
   * 🗑️ حذف تیکت
   */
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/tickets/${id}`);
      console.log(`✅ تیکت ${id} حذف شد`);
      return response.data;
    } catch (error) {
      console.error(`❌ خطا در حذف تیکت ${id}:`, error);
      throw error;
    }
  },

  /**
   * 🧹 پاک کردن کش کاربران
   */
  clearCache: () => {
    userCache.clear();
    console.log("🧹 کش کاربران پاک شد");
  },
};

// ✅ export کردن Ticket برای استفاده در جای دیگر
export type { Ticket };
