import { writable } from 'svelte/store';
import type {
	ConnectionState,
	MotorStatusUpdate,
	QueueUpdate,
	TransaksiEvent,
	WhatsappStatus
} from '$lib/types';

export const socketConnected = writable<boolean>(false);

export const whatsappStatus = writable<WhatsappStatus>({
	status: 'disconnected',
	session: 'default',
	isConnecting: false,
	qrCode: null,
	timestamp: new Date() as unknown as undefined
});

export const queueUpdates = writable<QueueUpdate | null>(null);
export const transaksiNotifications = writable<TransaksiEvent[]>([]);
export const motorStatusUpdates = writable<MotorStatusUpdate | null>(null);

export const connectionState = writable<ConnectionState>({
	isConnected: false,
	socketId: null,
	reconnectAttempt: 0
});
