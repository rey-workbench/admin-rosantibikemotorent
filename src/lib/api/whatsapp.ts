import { api } from "./client";
import type { WhatsappStatus } from "$lib/types";

export const whatsappApi = {
  // Session Management
  getStatus: async (): Promise<WhatsappStatus> => {
    const { data } = await api.get("/whatsapp/session-status");
    return data.data;
  },
  getQrCode: async (): Promise<{ qrcode: string | null }> => {
    const { data } = await api.get("/whatsapp/qrcode");
    return data.data;
  },
  connect: async (): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/start-all");
    return data.data;
  },
  resetSession: async (): Promise<unknown> => {
    const { data } = await api.get("/whatsapp/reset-session");
    return data.data;
  },
  logout: async (): Promise<void> => {
    await api.post("/whatsapp/logout-session");
  },

  // Chats & Contacts
  getChats: async (): Promise<any[]> => {
    const { data } = await api.get("/whatsapp/chats");
    return data.data;
  },
  getMessages: async (phone: string): Promise<any[]> => {
    const { data } = await api.get(`/whatsapp/messages/${phone}`);
    return data.data;
  },

  // Messaging
  sendMessage: async (to: string, message: string): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-message", {
      chatId: to,
      message,
    });
    return data.data;
  },
  reply: async (
    to: string,
    message: string,
    messageId: string,
    mentioned?: string[],
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/reply", {
      chatId: to,
      message,
      messageId,
      mentioned,
    });
    return data.data;
  },

  // Media
  sendImage: async (
    to: string,
    base64: string,
    caption?: string,
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-image", {
      chatId: to,
      imagePath: base64,
      caption,
    });
    return data.data;
  },
  sendFile: async (
    to: string,
    base64: string,
    filename: string,
    caption?: string,
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-file-base64", {
      chatId: to,
      base64,
      filename,
      caption,
    });
    return data.data;
  },
  sendImageAsSticker: async (to: string, base64: string): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-image-as-sticker", {
      chatId: to,
      imagePath: base64,
    });
    return data.data;
  },

  // Location & Others
  sendLocation: async (
    to: string,
    latitude: string,
    longitude: string,
    title?: string,
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-location", {
      chatId: to,
      latitude,
      longitude,
      title,
    });
    return data.data;
  },
  sendContactVcard: async (
    to: string,
    contactNumber: string,
    contactName: string,
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-contact-vcard", {
      chatId: to,
      contactNumber,
      contactName,
    });
    return data.data;
  },

  // Chat State
  sendSeen: async (to: string): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-seen", { chatId: to });
    return data.data;
  },
  startTyping: async (to: string): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/start-typing", { chatId: to });
    return data.data;
  },
  stopTyping: async (to: string): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/stop-typing", { chatId: to });
    return data.data;
  },

  // Templates
  getAllTemplates: async (): Promise<any[]> => {
    const { data } = await api.get("/whatsapp/templates");
    return data.data;
  },
  createTemplate: async (dto: {
    key: string;
    title?: string;
    content: string;
    category?: string;
    isActive?: boolean;
  }): Promise<any> => {
    const { data } = await api.post("/whatsapp/templates", dto);
    return data.data;
  },
  updateTemplate: async (
    id: string,
    dto: {
      key?: string;
      title?: string;
      content: string;
      category?: string;
      isActive?: boolean;
    },
  ): Promise<any> => {
    const { data } = await api.put(`/whatsapp/templates/${id}`, dto);
    return data.data;
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/whatsapp/templates/${id}`);
  },

  // Workflows
  getAllWorkflows: async (): Promise<any[]> => {
    const { data } = await api.get("/whatsapp/workflows");
    return data.data;
  },
  upsertWorkflow: async (
    id: string | null,
    dto: {
      name: string;
      trigger: string;
      keyword?: string;
      nodes: any;
      edges: any;
      isActive?: boolean;
    },
  ): Promise<any> => {
    if (id) {
      const { data } = await api.put(`/whatsapp/workflows/${id}`, dto);
      return data.data;
    } else {
      const { data } = await api.post(`/whatsapp/workflows`, dto);
      return data.data;
    }
  },
  deleteWorkflow: async (id: string): Promise<void> => {
    await api.delete(`/whatsapp/workflows/${id}`);
  },
};
