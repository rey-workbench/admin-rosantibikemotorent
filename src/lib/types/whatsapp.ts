export type WhatsappConnectionStatus =
	| 'connected'
	| 'connecting'
	| 'disconnected'
	| 'error'
	| 'qr_timeout';

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

export interface WhatsAppMessageEvent {
	id: any;
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
