export * from './ai';
export * from './api';
export * from './auth';
export * from './blog';
export * from './motor';
export * from './queue';
export * from './transaksi';
export * from './whatsapp';

export interface ConnectionState {
	isConnected: boolean;
	socketId: string | null;
	reconnectAttempt: number;
}

export interface DendaNotification {
	id: string;
	namaPenyewa: string;
	biayaDenda: number;
}
