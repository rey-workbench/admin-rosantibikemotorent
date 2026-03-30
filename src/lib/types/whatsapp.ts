export type WhatsappConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'qr_timeout';

export interface WhatsappStatus {
    status: WhatsappConnectionStatus;
    session: string;
    isConnecting: boolean;
    qrCode?: string | null;
    hasQrCode?: boolean;
    message?: string;
    loadingStatus?: { percent: number; message: string } | null;
    retryCount?: number;
    maxRetries?: number;
    reconnectAttemptInProgress?: boolean;
    timestamp?: Date;
}

export interface WhatsappSessionStatusResponse {
    session: string;
    status: WhatsappConnectionStatus;
    qrCode?: string | null;
}

export interface WhatsappContact {
    id: string;
    name: string;
    shortName?: string;
    pushname?: string;
    type?: string;
    isBusiness?: boolean;
    isEnterprise?: boolean;
    isUser?: boolean;
    isGroup?: boolean;
}

export interface WhatsappMessage {
    id: string;
    body: string;
    type: string;
    t: number;
    notifyName?: string;
    from: string;
    chatId: string;
    author?: string;
    self?: string;
    ack?: number;
    invis?: boolean;
    isNewMsg?: boolean;
    star?: boolean;
    recvFresh?: boolean;
    broadcast?: boolean;
    forwarded?: boolean;
    fromMe?: boolean;
    quotedMsg?: unknown;
    mentionedJidList?: string[];
    caption?: string;
    filename?: string;
    mimetype?: string;
}

export interface WhatsAppMessageEvent {
    id: string;
    from: string;
    chatId?: string;
    body: string;
    fromMe: boolean;
    timestamp: number;
    type: string;
    notifyName?: string;
    hasMedia?: boolean;
    mediaType?: string;
    mediaUrl?: string;
    messageData?: unknown;
}

export interface WhatsAppMessageSent {
    chatId: string;
    body?: string;
    messageId?: string;
    type: string;
    timestamp: Date;
}

export interface WhatsAppQrCode {
    qrCode: string | null;
    timestamp: Date;
}
