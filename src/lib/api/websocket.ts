import { io, type Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';

// ==================== Types ====================

export interface WhatsAppMessage {
    id: any;
    from: string;
    chatId?: string;
    body: string;
    type: 'incoming' | 'outgoing';
    timestamp: Date;
    messageId?: string;
    notifyName?: string;
    mediaType?: string;
    mediaUrl?: string;
}

export interface WhatsAppMessageSent {
    chatId: string;
    body?: string;
    messageId?: string;
    type: 'text' | 'image' | 'file' | 'location' | 'voice';
    timestamp: Date;
}

export interface WhatsAppStatus {
    connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error' | 'qr_timeout';
    hasQrCode?: boolean;
    message?: string;
    timestamp: Date;
}

export interface WhatsAppQrCode {
    qrCode: string | null;
    timestamp: Date;
}

export interface QueueUpdate {
    queue: string;
    jobId: string;
    status: string;
    timestamp: Date;
    [key: string]: any;
}

export interface HttpComplete {
    requestId: string;
    timestamp: Date;
    result: any;
}

export interface ConnectionState {
    isConnected: boolean;
    socketId: string | null;
    reconnectAttempt: number;
}

// ==================== Event Types ====================

type WhatsAppMessageHandler = (data: WhatsAppMessage) => void;
type WhatsAppMessageSentHandler = (data: WhatsAppMessageSent) => void;
type WhatsAppStatusHandler = (data: WhatsAppStatus) => void;
type WhatsAppQrCodeHandler = (data: WhatsAppQrCode) => void;
type QueueUpdateHandler = (data: QueueUpdate) => void;
type HttpCompleteHandler = (data: HttpComplete) => void;

// ==================== WebSocket Service ====================

class WebSocketService {
    private socket: Socket | null = null;
    private connectionState: Writable<ConnectionState>;
    private isInitialized = false;

    // Event handlers registry
    private whatsappMessageHandlers: Set<WhatsAppMessageHandler> = new Set();
    private whatsappMessageSentHandlers: Set<WhatsAppMessageSentHandler> = new Set();
    private whatsappStatusHandlers: Set<WhatsAppStatusHandler> = new Set();
    private whatsappQrCodeHandlers: Set<WhatsAppQrCodeHandler> = new Set();
    private queueUpdateHandlers: Set<QueueUpdateHandler> = new Set();
    private httpCompleteHandlers: Set<HttpCompleteHandler> = new Set();

    constructor() {
        this.connectionState = writable({
            isConnected: false,
            socketId: null,
            reconnectAttempt: 0
        });
    }

    // ==================== Connection Management ====================

    /**
     * Initialize WebSocket connection
     * Should be called once on app mount
     */
    connect(): void {
        if (this.isInitialized && this.socket?.connected) {
            console.log('[WebSocket] Already connected');
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3030';

        this.socket = io(`${apiUrl}/realtime`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        this.setupEventListeners();
        this.isInitialized = true;
    }

    /**
     * Disconnect WebSocket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isInitialized = false;
            this.connectionState.set({
                isConnected: false,
                socketId: null,
                reconnectAttempt: 0
            });
            console.log('[WebSocket] Disconnected');
        }
    }

    /**
     * Get connection state store for reactive updates
     */
    getConnectionState(): Writable<ConnectionState> {
        return this.connectionState;
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('[WebSocket] Connected:', this.socket?.id);
            this.connectionState.set({
                isConnected: true,
                socketId: this.socket?.id || null,
                reconnectAttempt: 0
            });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[WebSocket] Disconnected:', reason);
            this.connectionState.update(state => ({
                ...state,
                isConnected: false
            }));
        });

        this.socket.on('connect_error', (error) => {
            console.error('[WebSocket] Connection error:', error.message);
        });

        this.socket.io.on('reconnect_attempt', (attempt) => {
            console.log('[WebSocket] Reconnecting, attempt:', attempt);
            this.connectionState.update(state => ({
                ...state,
                reconnectAttempt: attempt
            }));
        });

        this.socket.io.on('reconnect', () => {
            console.log('[WebSocket] Reconnected');
        });

        // Server ping for keep-alive
        this.socket.on('ping', (data) => {
            // Respond to keep connection alive
        });

        this.socket.on('connected', (data) => {
            console.log('[WebSocket] Server confirmed connection:', data);
        });

        // ==================== WhatsApp Events ====================

        this.socket.on('whatsapp:message', (data: WhatsAppMessage) => {
            console.log('[WebSocket] WhatsApp message received:', data);
            this.whatsappMessageHandlers.forEach(handler => handler(data));
        });

        this.socket.on('whatsapp:message-sent', (data: WhatsAppMessageSent) => {
            console.log('[WebSocket] WhatsApp message sent:', data);
            this.whatsappMessageSentHandlers.forEach(handler => handler(data));
        });

        this.socket.on('whatsapp:status', (data: WhatsAppStatus) => {
            console.log('[WebSocket] WhatsApp status:', data);
            this.whatsappStatusHandlers.forEach(handler => handler(data));
        });

        this.socket.on('whatsapp:qrcode', (data: WhatsAppQrCode) => {
            console.log('[WebSocket] WhatsApp QR code updated');
            this.whatsappQrCodeHandlers.forEach(handler => handler(data));
        });

        // ==================== Queue Events ====================

        this.socket.on('queue:update', (data: QueueUpdate) => {
            console.log('[WebSocket] Queue update:', data);
            this.queueUpdateHandlers.forEach(handler => handler(data));
        });

        // ==================== HTTP Events ====================

        this.socket.on('http:complete', (data: HttpComplete) => {
            console.log('[WebSocket] HTTP complete:', data);
            this.httpCompleteHandlers.forEach(handler => handler(data));
        });
    }

    // ==================== WhatsApp Event Subscriptions ====================

    /**
     * Subscribe to incoming WhatsApp messages
     */
    onWhatsAppMessage(handler: WhatsAppMessageHandler): () => void {
        this.whatsappMessageHandlers.add(handler);
        return () => this.whatsappMessageHandlers.delete(handler);
    }

    /**
     * Subscribe to WhatsApp message sent confirmations
     */
    onWhatsAppMessageSent(handler: WhatsAppMessageSentHandler): () => void {
        this.whatsappMessageSentHandlers.add(handler);
        return () => this.whatsappMessageSentHandlers.delete(handler);
    }

    /**
     * Subscribe to WhatsApp connection status changes
     */
    onWhatsAppStatus(handler: WhatsAppStatusHandler): () => void {
        this.whatsappStatusHandlers.add(handler);
        return () => this.whatsappStatusHandlers.delete(handler);
    }

    /**
     * Subscribe to WhatsApp QR code updates
     */
    onWhatsAppQrCode(handler: WhatsAppQrCodeHandler): () => void {
        this.whatsappQrCodeHandlers.add(handler);
        return () => this.whatsappQrCodeHandlers.delete(handler);
    }

    // ==================== Queue Event Subscriptions ====================

    /**
     * Subscribe to queue updates
     */
    onQueueUpdate(handler: QueueUpdateHandler): () => void {
        this.queueUpdateHandlers.add(handler);
        return () => this.queueUpdateHandlers.delete(handler);
    }

    // ==================== HTTP Event Subscriptions ====================

    /**
     * Subscribe to HTTP request completions
     */
    onHttpComplete(handler: HttpCompleteHandler): () => void {
        this.httpCompleteHandlers.add(handler);
        return () => this.httpCompleteHandlers.delete(handler);
    }

    // ==================== Utility Methods ====================

    /**
     * Check if socket is currently connected
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    /**
     * Get socket ID if connected
     */
    getSocketId(): string | null {
        return this.socket?.id ?? null;
    }
}

// ==================== Singleton Export ====================

// Create singleton instance
const websocketService = new WebSocketService();

// Export singleton
export default websocketService;

// Export individual methods for convenience
export const {
    connect,
    disconnect,
    getConnectionState,
    onWhatsAppMessage,
    onWhatsAppMessageSent,
    onWhatsAppStatus,
    onWhatsAppQrCode,
    onQueueUpdate,
    onHttpComplete,
    isConnected,
    getSocketId
} = {
    connect: () => websocketService.connect(),
    disconnect: () => websocketService.disconnect(),
    getConnectionState: () => websocketService.getConnectionState(),
    onWhatsAppMessage: (h: WhatsAppMessageHandler) => websocketService.onWhatsAppMessage(h),
    onWhatsAppMessageSent: (h: WhatsAppMessageSentHandler) => websocketService.onWhatsAppMessageSent(h),
    onWhatsAppStatus: (h: WhatsAppStatusHandler) => websocketService.onWhatsAppStatus(h),
    onWhatsAppQrCode: (h: WhatsAppQrCodeHandler) => websocketService.onWhatsAppQrCode(h),
    onQueueUpdate: (h: QueueUpdateHandler) => websocketService.onQueueUpdate(h),
    onHttpComplete: (h: HttpCompleteHandler) => websocketService.onHttpComplete(h),
    isConnected: () => websocketService.isConnected(),
    getSocketId: () => websocketService.getSocketId()
};
