import api from "./axios";
import type { WhatsappStatus, WhatsappSessionStatusResponse } from "$lib/types";

export const whatsappApi = {
  // Session Management
  getStatus: async (): Promise<WhatsappStatus> => {
    const { data } = await api.get("/whatsapp/session-status");
    return data.data;
  },
  getAllSessions: async (): Promise<WhatsappSessionStatusResponse[]> => {
    const { data } = await api.get("/whatsapp/all-sessions");
    return data.data;
  },
  getQrCode: async (): Promise<{ qrcode: string | null }> => {
    const { data } = await api.get("/whatsapp/qrcode");
    return data.data;
  },
  startSession: async (): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/start-all");
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
  getContact: async (phone: string): Promise<any> => {
    const { data } = await api.get(`/whatsapp/contacts/${phone}`);
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
  sendMessageOptions: async (
    to: string,
    message: string,
    options: any,
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-message-options", {
      chatId: to,
      message,
      ...options,
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
  forwardMessages: async (
    to: string,
    messageIds: string[],
    skipMyMessages?: boolean,
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/forward-messages", {
      chatId: to,
      messageIds,
      skipMyMessages,
    });
    return data.data;
  },
  sendToAdmin: async (message: string): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-to-admin", { message });
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
  sendVoice: async (to: string, base64: string): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-voice", {
      chatId: to,
      base64,
    });
    return data.data;
  },
  sendVideoAsGif: async (
    to: string,
    base64: string,
    caption?: string,
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-video-as-gif", {
      chatId: to,
      videoPath: base64,
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
  sendImageAsStickerGif: async (
    to: string,
    base64: string,
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-image-as-sticker-gif", {
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
  sendLinkPreview: async (
    to: string,
    url: string,
    title: string,
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-link-preview", {
      chatId: to,
      url,
      caption: title,
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
  sendContactVcardList: async (
    to: string,
    contacts: any[],
  ): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/send-contact-vcard-list", {
      chatId: to,
      contacts,
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
  setChatState: async (to: string, state: number): Promise<unknown> => {
    const { data } = await api.post("/whatsapp/set-chat-state", {
      chatId: to,
      state,
    });
    return data.data;
  },
  // Templates
  getAllTemplates: async (): Promise<any[]> => {
    const { data } = await api.get("/whatsapp/templates");
    return data.data;
  },
  getTemplateById: async (id: string): Promise<any> => {
    const { data } = await api.get(`/whatsapp/templates/id/${id}`);
    return data.data;
  },
  getTemplateByKey: async (key: string): Promise<any> => {
    const { data } = await api.get(`/whatsapp/templates/key/${key}`);
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
  getWorkflow: async (id: string): Promise<any> => {
    const { data } = await api.get(`/whatsapp/workflows/${id}`);
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
