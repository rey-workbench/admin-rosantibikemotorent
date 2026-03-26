import api from './axios';
import type { WhatsappStatus, WhatsappSessionStatusResponse } from '$lib/types';

export const whatsappApi = {
    // Session Management
    getStatus: async (): Promise<WhatsappStatus> => {
        const { data } = await api.get('/whatsapp/session-status');
        return data.data || data;
    },
    getAllSessions: async (): Promise<WhatsappSessionStatusResponse[]> => {
        const { data } = await api.get('/whatsapp/all-sessions');
        return data.data || data;
    },
    getQrCode: async (): Promise<{ qrcode: string | null }> => {
        const { data } = await api.get('/whatsapp/qrcode');
        return data.data || data;
    },
    startSession: async (): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/start-all');
        return data.data || data;
    },
    connect: async (): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/start-all');
        return data.data || data;
    },
    resetSession: async (): Promise<unknown> => {
        const { data } = await api.get('/whatsapp/reset-session');
        return data.data || data;
    },
    logout: async (): Promise<void> => {
        await api.post('/whatsapp/logout-session');
    },

    // Chats & Contacts
    getChats: async (): Promise<any[]> => {
        const { data } = await api.get('/whatsapp/chats');
        return data.data || data;
    },
    getContact: async (phone: string): Promise<any> => {
        const { data } = await api.get(`/whatsapp/contacts/${phone}`);
        return data.data || data;
    },
    getMessages: async (phone: string): Promise<any[]> => {
        const { data } = await api.get(`/whatsapp/messages/${phone}`);
        return data.data || data;
    },

    // Messaging
    sendMessage: async (to: string, message: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-message', { chatId: to, message });
        return data.data || data;
    },
    sendMessageOptions: async (to: string, message: string, options: any): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-message-options', { chatId: to, message, ...options });
        return data.data || data;
    },
    reply: async (to: string, message: string, messageId: string, mentioned?: string[]): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/reply', { chatId: to, message, messageId, mentioned });
        return data.data || data;
    },
    forwardMessages: async (to: string, messageIds: string[], skipMyMessages?: boolean): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/forward-messages', { chatId: to, messageIds, skipMyMessages });
        return data.data || data;
    },
    sendToAdmin: async (message: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-to-admin', { message });
        return data.data || data;
    },

    // Media
    sendImage: async (to: string, base64: string, caption?: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-image', { chatId: to, imagePath: base64, caption });
        return data.data || data;
    },
    sendFile: async (to: string, base64: string, filename: string, caption?: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-file-base64', { chatId: to, base64, filename, caption });
        return data.data || data;
    },
    sendVoice: async (to: string, base64: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-voice', { chatId: to, base64 });
        return data.data || data;
    },
    sendVideoAsGif: async (to: string, base64: string, caption?: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-video-as-gif', { chatId: to, videoPath: base64, caption });
        return data.data || data;
    },
    sendImageAsSticker: async (to: string, base64: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-image-as-sticker', { chatId: to, imagePath: base64 });
        return data.data || data;
    },
    sendImageAsStickerGif: async (to: string, base64: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-image-as-sticker-gif', { chatId: to, imagePath: base64 });
        return data.data || data;
    },

    // Location & Others
    sendLocation: async (to: string, latitude: string, longitude: string, title?: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-location', { chatId: to, latitude, longitude, title });
        return data.data || data;
    },
    sendLinkPreview: async (to: string, url: string, title: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-link-preview', { chatId: to, url, caption: title });
        return data.data || data;
    },
    sendContactVcard: async (to: string, contactNumber: string, contactName: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-contact-vcard', { chatId: to, contactNumber, contactName });
        return data.data || data;
    },
    sendContactVcardList: async (to: string, contacts: any[]): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-contact-vcard-list', { chatId: to, contacts });
        return data.data || data;
    },

    // Chat State
    sendSeen: async (to: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-seen', { chatId: to });
        return data.data || data;
    },
    startTyping: async (to: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/start-typing', { chatId: to });
        return data.data || data;
    },
    stopTyping: async (to: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/stop-typing', { chatId: to });
        return data.data || data;
    },
    setChatState: async (to: string, state: number): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/set-chat-state', { chatId: to, state });
        return data.data || data;
    },
    // Templates
    getAllTemplates: async (): Promise<any[]> => {
        const { data } = await api.get('/whatsapp/templates');
        return data.data || data;
    },
    getTemplate: async (key: string): Promise<any> => {
        const { data } = await api.get(`/whatsapp/templates/${key}`);
        return data.data || data;
    },
    upsertTemplate: async (key: string, dto: { title?: string; content: string; category?: string }): Promise<any> => {
        const { data } = await api.put(`/whatsapp/templates/${key}`, dto);
        return data.data || data;
    },
    deleteTemplate: async (key: string): Promise<void> => {
        await api.delete(`/whatsapp/templates/${key}`);
    },

    // Workflows
    getAllWorkflows: async (): Promise<any[]> => {
        const { data } = await api.get('/whatsapp/workflows');
        return data.data || data;
    },
    getWorkflow: async (id: string): Promise<any> => {
        const { data } = await api.get(`/whatsapp/workflows/${id}`);
        return data.data || data;
    },
    upsertWorkflow: async (id: string | null, dto: { name: string; trigger: string; keyword?: string; nodes: any; edges: any; isActive?: boolean }): Promise<any> => {
        if (id) {
            const { data } = await api.put(`/whatsapp/workflows/${id}`, dto);
            return data.data || data;
        } else {
            const { data } = await api.post(`/whatsapp/workflows`, dto);
            return data.data || data;
        }
    },
    deleteWorkflow: async (id: string): Promise<void> => {
        await api.delete(`/whatsapp/workflows/${id}`);
    }
};
