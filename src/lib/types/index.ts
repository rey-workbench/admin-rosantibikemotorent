export * from "./api";
export * from "./auth";
export * from "./motor";
export * from "./transaksi";
export * from "./blog";
export * from "./whatsapp";
export * from "./queue";
export * from "./ai";

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
