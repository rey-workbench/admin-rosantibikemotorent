import { io, type Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

import type { WhatsappStatus, WhatsappConnectionStatus, QueueStatus, ApiResponse } from '$lib/types';

// ==================== Stores (Replaces socket.ts) ====================

export const socketConnected = writable<boolean>(false);
export const whatsappStatus = writable<WhatsappStatus>({
    status: 'disconnected',
    session: 'default',
    isConnecting: false,
    qrCode: null,
    timestamp: new Date() as any
});
export const queueUpdates = writable<any | null>(null);

// ==================== WebSocket Service ====================

// Local interfaces for events that might differ from main types
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

// ==================== WebSocket Service ====================

type WhatsAppMessageHandler = (data: WhatsAppMessage) => void;
type WhatsAppMessageSentHandler = (data: WhatsAppMessageSent) => void;
type WhatsAppStatusHandler = (data: WhatsappStatus) => void;
type WhatsAppQrCodeHandler = (data: WhatsAppQrCode) => void;
type QueueUpdateHandler = (data: QueueUpdate) => void;
type HttpCompleteHandler = (data: HttpComplete) => void;

class WebSocketService {
    private socket: Socket | null = null;
    private connectionState: Writable<ConnectionState>;
    private isInitialized = false;

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

    connect(): void {
        if (!browser || (this.isInitialized && this.socket?.connected)) {
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3030';
        
        // --- OPTIMASI "THE ROSANTI WAY" ---
        // Gunakan hanya 'websocket' untuk menghindari NPROC meledak di cPanel
        this.socket = io(`${apiUrl}/realtime`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            autoConnect: true,
        });

        this.setupEventListeners();
        this.isInitialized = true;

        // Cleanup on hard refresh/unload to prevent zombie processes
        if (browser) {
            window.addEventListener('beforeunload', () => this.disconnect());
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isInitialized = false;
            this.updateState(false, null);
            console.log('[Socket] Disconnected');
        }
    }

    private updateState(isConnected: boolean, socketId: string | null) {
        socketConnected.set(isConnected);
        this.connectionState.update(state => ({
            ...state,
            isConnected,
            socketId
        }));
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('[Socket] Connected:', this.socket?.id);
            this.updateState(true, this.socket?.id || null);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            this.updateState(false, null);
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
        });

        this.socket.io.on('reconnect_attempt', (attempt) => {
            console.log('[Socket] Reconnecting, attempt:', attempt);
            this.connectionState.update(state => ({
                ...state,
                reconnectAttempt: attempt
            }));
        });

        this.socket.on('whatsapp:message', (data: WhatsAppMessage) => {
            this.whatsappMessageHandlers.forEach(handler => handler(data));
        });

        this.socket.on('whatsapp:message-sent', (data: WhatsAppMessageSent) => {
            this.whatsappMessageSentHandlers.forEach(handler => handler(data));
        });

        this.socket.on('whatsapp:status', (data: any) => {
            // Map backend's 'connectionStatus' to frontend's 'status'
            const mappedStatus: WhatsappStatus = {
                ...data,
                status: data.connectionStatus || data.status || 'disconnected',
                isConnecting: data.connectionStatus === 'connecting' || data.isConnecting
            };
            whatsappStatus.set(mappedStatus);
            this.whatsappStatusHandlers.forEach(handler => handler(mappedStatus));
        });

        this.socket.on('whatsapp:qrcode', (data: WhatsAppQrCode) => {
            this.whatsappQrCodeHandlers.forEach(handler => handler(data));
        });

        this.socket.on('queue:update', (data: QueueUpdate) => {
            queueUpdates.set(data);
            this.queueUpdateHandlers.forEach(handler => handler(data));
        });

        this.socket.on('http:complete', (data: HttpComplete) => {
            this.httpCompleteHandlers.forEach(handler => handler(data));
        });
    }

    // --- Subscriptions (for ChatWidget) ---
    onWhatsAppMessage(h: WhatsAppMessageHandler) { this.whatsappMessageHandlers.add(h); return () => this.whatsappMessageHandlers.delete(h); }
    onWhatsAppMessageSent(h: WhatsAppMessageSentHandler) { this.whatsappMessageSentHandlers.add(h); return () => this.whatsappMessageSentHandlers.delete(h); }
    onWhatsAppStatus(h: WhatsAppStatusHandler) { this.whatsappStatusHandlers.add(h); return () => this.whatsappStatusHandlers.delete(h); }
    onWhatsAppQrCode(h: WhatsAppQrCodeHandler) { this.whatsappQrCodeHandlers.add(h); return () => this.whatsappQrCodeHandlers.delete(h); }
    onQueueUpdate(h: QueueUpdateHandler) { this.queueUpdateHandlers.add(h); return () => this.queueUpdateHandlers.delete(h); }
    onHttpComplete(h: HttpCompleteHandler) { this.httpCompleteHandlers.add(h); return () => this.httpCompleteHandlers.delete(h); }

    isConnected(): boolean { return this.socket?.connected ?? false; }
    getSocketId(): string | null { return this.socket?.id ?? null; }
    getConnectionState(): Writable<ConnectionState> { return this.connectionState; }
}

const websocketService = new WebSocketService();
export default websocketService;
