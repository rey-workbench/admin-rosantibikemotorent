import { io, type Socket } from 'socket.io-client';
import { browser } from '$app/environment';

const WS_CHANNELS = {
	WHATSAPP_MESSAGE: 'whatsapp:message',
	WHATSAPP_MESSAGE_SENT: 'whatsapp:message-sent',
	WHATSAPP_STATUS: 'whatsapp:status',
	WHATSAPP_QRCODE: 'whatsapp:qrcode',
	QUEUE_UPDATE: 'queue:update',
	TRANSAKSI_CREATED: 'transaksi:created',
	TRANSAKSI_UPDATED: 'transaksi:updated',
	TRANSAKSI_DELETED: 'transaksi:deleted',
	TRANSAKSI_SELESAI: 'transaksi:selesai',
	MOTOR_STATUS_UPDATE: 'motor-status:update',
	UNIT_MOTOR_UPDATE: 'unit-motor:update',
	JENIS_MOTOR_UPDATE: 'jenis-motor:update',
	DENDA_NOTIFICATION: 'denda:notification'
} as const;

import {
	connectionState,
	motorStatusUpdates,
	queueUpdates,
	socketConnected,
	transaksiNotifications,
	whatsappStatus
} from '$lib/stores/websocket';
import type {
	DendaNotification,
	MotorStatusUpdate,
	QueueUpdate,
	TransaksiEvent,
	UnitMotorUpdate,
	WhatsAppMessageEvent,
	WhatsAppMessageSent,
	WhatsappConnectionStatus,
	WhatsappStatus
} from '$lib/types';

type WhatsAppMessageHandler = (data: WhatsAppMessageEvent) => void;
type WhatsAppMessageSentHandler = (data: WhatsAppMessageSent) => void;
type WhatsAppStatusHandler = (data: WhatsappStatus) => void;
type WhatsAppQrCodeHandler = (data: { qrCode: string | null; timestamp: Date }) => void;
type QueueUpdateHandler = (data: QueueUpdate) => void;
type HttpCompleteHandler = (data: { requestId: string; timestamp: Date; result: unknown }) => void;
type TransaksiCreatedHandler = (data: TransaksiEvent) => void;
type TransaksiUpdatedHandler = (data: TransaksiEvent) => void;
type TransaksiDeletedHandler = (data: { id: string }) => void;
type TransaksiSelesaiHandler = (data: TransaksiEvent) => void;
type MotorStatusUpdateHandler = (data: MotorStatusUpdate) => void;
type UnitMotorUpdateHandler = (data: UnitMotorUpdate) => void;
type JenisMotorUpdateHandler = (data: { action: string; data?: unknown; id?: string }) => void;
type DendaNotificationHandler = (data: DendaNotification) => void;

class WebSocketService {
	private socket: Socket | null = null;

	private beforeUnloadHandler: (() => void) | null = null;

	private whatsappMessageHandlers = new Set<WhatsAppMessageHandler>();
	private whatsappMessageSentHandlers = new Set<WhatsAppMessageSentHandler>();
	private whatsappStatusHandlers = new Set<WhatsAppStatusHandler>();
	private whatsappQrCodeHandlers = new Set<WhatsAppQrCodeHandler>();
	private queueUpdateHandlers = new Set<QueueUpdateHandler>();
	private httpCompleteHandlers = new Set<HttpCompleteHandler>();
	private transaksiCreatedHandlers = new Set<TransaksiCreatedHandler>();
	private transaksiUpdatedHandlers = new Set<TransaksiUpdatedHandler>();
	private transaksiDeletedHandlers = new Set<TransaksiDeletedHandler>();
	private transaksiSelesaiHandlers = new Set<TransaksiSelesaiHandler>();
	private motorStatusUpdateHandlers = new Set<MotorStatusUpdateHandler>();
	private unitMotorUpdateHandlers = new Set<UnitMotorUpdateHandler>();
	private jenisMotorUpdateHandlers = new Set<JenisMotorUpdateHandler>();
	private dendaNotificationHandlers = new Set<DendaNotificationHandler>();

	connect(): void {
		if (!browser) return;
		if (window.location.pathname === '/login') return;
		if (this.socket && (this.socket.connected || this.socket.active)) return;

		if (this.socket) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
			this.socket = null;
		}

		let apiUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL?.replace(/\/api$/, '');
		if (!apiUrl) {
			if (browser && window.location.hostname.includes('rosantibikemotorent.com')) {
				apiUrl = 'https://api.rosantibikemotorent.com';
			} else {
				apiUrl = `${window.location.protocol}//${window.location.hostname}:3030`;
			}
		}

		this.socket = io(`${apiUrl}/realtime`, {
			transports: ['websocket'],
			// httpOnly cookie dikirim otomatis (backend baca accessToken dari cookie)
			withCredentials: true,
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 2000,
			autoConnect: true
		});

		this.setupEventListeners();

		if (browser && !this.beforeUnloadHandler) {
			this.beforeUnloadHandler = () => this.disconnect();
			window.addEventListener('beforeunload', this.beforeUnloadHandler);
		}
	}

	disconnect(): void {
		if (this.socket) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
			this.socket = null;
			this.updateState(false, null);
		}

		if (browser && this.beforeUnloadHandler) {
			window.removeEventListener('beforeunload', this.beforeUnloadHandler);
			this.beforeUnloadHandler = null;
		}
	}

	private updateState(isConnected: boolean, socketId: string | null): void {
		socketConnected.set(isConnected);
		connectionState.update((state) => ({
			...state,
			isConnected,
			socketId
		}));
	}

	private setupEventListeners(): void {
		if (!this.socket) return;

		this.socket.on('connect', () => {
			this.updateState(true, this.socket?.id || null);
		});

		this.socket.on('disconnect', (_reason) => {
			this.updateState(false, null);
		});

		this.socket.on('connect_error', (error) => {
			console.warn('[Socket] Connection error:', error.message);
		});

		this.socket.io.on('reconnect_attempt', (attempt) => {
			connectionState.update((state) => ({
				...state,
				reconnectAttempt: attempt
			}));
		});

		this.socket.on(WS_CHANNELS.WHATSAPP_MESSAGE, (data: WhatsAppMessageEvent) => {
			this.whatsappMessageHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(WS_CHANNELS.WHATSAPP_MESSAGE_SENT, (data: WhatsAppMessageSent) => {
			this.whatsappMessageSentHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(WS_CHANNELS.WHATSAPP_STATUS, (data: any) => {
			const rawStatus = data?.connectionStatus || data?.status || 'disconnected';

			// Map common status variants if necessary
			let status: WhatsappConnectionStatus = 'disconnected';
			const statusStr = String(rawStatus);
			if (['connected', 'connecting', 'disconnected', 'error', 'qr_timeout'].includes(statusStr)) {
				status = statusStr as WhatsappConnectionStatus;
			} else if (statusStr === 'open' || statusStr === 'authenticated') {
				status = 'connected';
			} else if (statusStr === 'close') {
				status = 'disconnected';
			}

			const mappedStatus: WhatsappStatus = {
				...data,
				status,
				isConnecting: data?.connectionStatus === 'connecting' || Boolean(data?.isConnecting),
				session: data?.session || 'default'
			};
			whatsappStatus.set(mappedStatus);
			this.whatsappStatusHandlers.forEach((handler) => handler(mappedStatus));
		});

		this.socket.on(WS_CHANNELS.WHATSAPP_QRCODE, (data: unknown) => {
			const qrCode =
				typeof data === 'string'
					? data
					: ((data as Record<string, unknown>)?.qrCode as string | null);
			whatsappStatus.update((state) => ({
				...state,
				qrCode,
				hasQrCode: !!qrCode,
				status: qrCode ? 'connecting' : state.status === 'connecting' ? 'connecting' : state.status
			}));
			this.whatsappQrCodeHandlers.forEach((handler) => handler({ qrCode, timestamp: new Date() }));
		});

		this.socket.on(WS_CHANNELS.QUEUE_UPDATE, (data: QueueUpdate) => {
			queueUpdates.set(data);
			this.queueUpdateHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(
			'http:complete',
			(data: { requestId: string; timestamp: Date; result: unknown }) => {
				this.httpCompleteHandlers.forEach((handler) => handler(data));
			}
		);

		this.socket.on(WS_CHANNELS.TRANSAKSI_CREATED, (data: TransaksiEvent) => {
			transaksiNotifications.update((list) => [data, ...list].slice(0, 50));
			this.transaksiCreatedHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(WS_CHANNELS.TRANSAKSI_UPDATED, (data: TransaksiEvent) => {
			this.transaksiUpdatedHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(WS_CHANNELS.TRANSAKSI_DELETED, (data: { id: string }) => {
			this.transaksiDeletedHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(WS_CHANNELS.TRANSAKSI_SELESAI, (data: TransaksiEvent) => {
			this.transaksiSelesaiHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(WS_CHANNELS.MOTOR_STATUS_UPDATE, (data: MotorStatusUpdate) => {
			motorStatusUpdates.set(data);
			this.motorStatusUpdateHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(WS_CHANNELS.UNIT_MOTOR_UPDATE, (data: UnitMotorUpdate) => {
			this.unitMotorUpdateHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(WS_CHANNELS.JENIS_MOTOR_UPDATE, (data: { action: string; data?: unknown; id?: string }) => {
			this.jenisMotorUpdateHandlers.forEach((handler) => handler(data));
		});

		this.socket.on(WS_CHANNELS.DENDA_NOTIFICATION, (data: DendaNotification) => {
			this.dendaNotificationHandlers.forEach((handler) => handler(data));
		});
	}

	onWhatsAppMessage(h: WhatsAppMessageHandler): () => void {
		this.whatsappMessageHandlers.add(h);
		return () => this.whatsappMessageHandlers.delete(h);
	}

	onWhatsAppMessageSent(h: WhatsAppMessageSentHandler): () => void {
		this.whatsappMessageSentHandlers.add(h);
		return () => this.whatsappMessageSentHandlers.delete(h);
	}

	onWhatsAppStatus(h: WhatsAppStatusHandler): () => void {
		this.whatsappStatusHandlers.add(h);
		return () => this.whatsappStatusHandlers.delete(h);
	}

	onWhatsAppQrCode(h: WhatsAppQrCodeHandler): () => void {
		this.whatsappQrCodeHandlers.add(h);
		return () => this.whatsappQrCodeHandlers.delete(h);
	}

	onQueueUpdate(h: QueueUpdateHandler): () => void {
		this.queueUpdateHandlers.add(h);
		return () => this.queueUpdateHandlers.delete(h);
	}

	onHttpComplete(h: HttpCompleteHandler): () => void {
		this.httpCompleteHandlers.add(h);
		return () => this.httpCompleteHandlers.delete(h);
	}

	onTransaksiCreated(h: TransaksiCreatedHandler): () => void {
		this.transaksiCreatedHandlers.add(h);
		return () => this.transaksiCreatedHandlers.delete(h);
	}

	onTransaksiUpdated(h: TransaksiUpdatedHandler): () => void {
		this.transaksiUpdatedHandlers.add(h);
		return () => this.transaksiUpdatedHandlers.delete(h);
	}

	onTransaksiDeleted(h: TransaksiDeletedHandler): () => void {
		this.transaksiDeletedHandlers.add(h);
		return () => this.transaksiDeletedHandlers.delete(h);
	}

	onTransaksiSelesai(h: TransaksiSelesaiHandler): () => void {
		this.transaksiSelesaiHandlers.add(h);
		return () => this.transaksiSelesaiHandlers.delete(h);
	}

	onMotorStatusUpdate(h: MotorStatusUpdateHandler): () => void {
		this.motorStatusUpdateHandlers.add(h);
		return () => this.motorStatusUpdateHandlers.delete(h);
	}

	onUnitMotorUpdate(h: UnitMotorUpdateHandler): () => void {
		this.unitMotorUpdateHandlers.add(h);
		return () => this.unitMotorUpdateHandlers.delete(h);
	}

	onJenisMotorUpdate(h: JenisMotorUpdateHandler): () => void {
		this.jenisMotorUpdateHandlers.add(h);
		return () => this.jenisMotorUpdateHandlers.delete(h);
	}

	onDendaNotification(h: DendaNotificationHandler): () => void {
		this.dendaNotificationHandlers.add(h);
		return () => this.dendaNotificationHandlers.delete(h);
	}

	isConnected(): boolean {
		return this.socket?.connected ?? false;
	}

	getSocketId(): string | null {
		return this.socket?.id ?? null;
	}
}

export const websocketService = new WebSocketService();
