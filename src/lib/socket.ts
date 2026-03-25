import { io, Socket } from 'socket.io-client';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

import type { WhatsappStatus, WhatsappConnectionStatus } from './types';

// Socket connection state
export const socketConnected = writable<boolean>(false);

export const whatsappStatus = writable<WhatsappStatus>({
    status: 'disconnected',
    session: 'rosantibikemotorent',
    isConnecting: false,
    qrCode: null
});

export const queueUpdates = writable<{
    queue: string;
    jobId: string;
    status: string;
    data?: unknown;
} | null>(null);

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3030';

export function initSocket(): Socket | null {
    if (!browser) return null;

    if (socket?.connected) {
        return socket;
    }

    // Connect to /realtime namespace as per NestJS gateway
    socket = io(`${SOCKET_URL}/realtime`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('[Socket.IO] Connected:', socket?.id);
        socketConnected.set(true);
    });

    socket.on('connected', (data) => {
        console.log('[Socket.IO] Server confirmed connection:', data);
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] Disconnected:', reason);
        socketConnected.set(false);
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket.IO] Connection error:', error.message);
        socketConnected.set(false);
    });

    socket.on('ping', (data) => {
        console.log('[Socket.IO] Ping:', data.timestamp);
    });

    // WhatsApp Status updates
    socket.on('whatsapp:status', (data: any) => {
        console.log('[Socket.IO] WhatsApp Status:', data);
        whatsappStatus.update(current => ({
            ...current,
            status: (data.connectionStatus as WhatsappConnectionStatus) || 'disconnected',
            isConnecting: data.connectionStatus === 'connecting',
            qrCode: data.hasQrCode && data.qrCode ? data.qrCode : (data.connectionStatus === 'connected' ? null : current.qrCode),
            loadingStatus: data.message && data.connectionStatus === 'connecting' ? { percent: 0, message: data.message } : undefined
        }));
    });

    socket.on('whatsapp:qrcode', (data: { qrCode: string }) => {
        console.log('[Socket.IO] WhatsApp QR:', 'Received');
        whatsappStatus.update(current => ({
            ...current,
            qrCode: data.qrCode,
            status: 'connecting',
            isConnecting: true
        }));
    });

    // Queue updates
    socket.on('queue:update', (data: { queue: string; jobId: string; status: string }) => {
        console.log('[Socket.IO] Queue update:', data);
        queueUpdates.set(data);
    });

    // HTTP request complete
    socket.on('http:complete', (data: { requestId: string; result: unknown }) => {
        console.log('[Socket.IO] HTTP complete:', data.requestId);
    });

    return socket;
}

export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
        socketConnected.set(false);
    }
}

export function getSocket(): Socket | null {
    return socket;
}
