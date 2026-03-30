export * from './api';
export * from './auth';
export * from './motor';
export * from './transaksi';
export * from './blog';
export * from './whatsapp';
export * from './queue';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

export interface ConfirmOptions {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    confirmText?: string;
    cancelText?: string;
}

export interface ConfirmState extends ConfirmOptions {
    open: boolean;
    resolve: (value: boolean) => void;
}

export interface ConnectionState {
    isConnected: boolean;
    socketId: string | null;
    reconnectAttempt: number;
}

export interface HttpComplete {
    requestId: string;
    timestamp: Date;
    result: unknown;
}

export interface DendaNotification {
    id: string;
    namaPenyewa: string;
    biayaDenda: number;
}
