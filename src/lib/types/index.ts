// API Response types
export interface ApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Auth types
export interface Admin {
    id: string;
    username: string;
    nama: string;
    email?: string;
    createdAt?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    admin: Admin;
    token: string;
    message: string;
}

// Jenis Motor types
export interface JenisMotor {
    id: string;
    merk: string;
    model: string;
    cc: number;
    gambar?: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

// Unit Motor types
export type StatusMotor = 'TERSEDIA' | 'DISEWA' | 'PERBAIKAN' | 'DIPESAN' | 'OVERDUE';

export interface UnitMotor {
    id: string;
    platNomor: string;
    jenisId: string;
    jenis?: JenisMotor;
    jenisMotor?: JenisMotor;
    status: StatusMotor;
    hargaSewa: number;
    tahunPembuatan?: number;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

// Transaksi types
export type StatusTransaksi = 'PENDING' | 'AKTIF' | 'SELESAI' | 'OVERDUE' | 'DIBATALKAN';

export interface Transaksi {
    id: string;
    namaPenyewa: string;
    noWhatsapp: string;
    noKTP?: string;
    unitId: string;
    unitMotor?: UnitMotor;
    tanggalMulai: string;
    tanggalSelesai: string;
    jamMulai: string;
    jamSelesai: string;
    helm: number;
    jasHujan: number;
    totalBiaya: number;
    status: StatusTransaksi;
    createdAt: string;
    updatedAt: string;
}

// Blog types
export type StatusArtikel = 'DRAFT' | 'TERBIT';

export interface BlogPost {
    id: string;
    judul: string;
    slug: string;
    konten: string;
    thumbnail?: string;
    featuredImage?: string;
    status: StatusArtikel;
    kategoriId?: string;
    kategori?: BlogKategori;
    tags?: BlogTag[];
    metaTitle?: string;
    metaDescription?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BlogKategori {
    id: string;
    nama: string;
    slug: string;
}

export interface BlogTag {
    id: string;
    nama: string;
    slug: string;
}

// WhatsApp types
export type WhatsappConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface WhatsappStatus {
    status: WhatsappConnectionStatus;
    session: string;
    isConnecting: boolean;
    qrCode?: string | null;
    loadingStatus?: {
        percent: number;
        message: string;
    } | null;
}

// Queue types
export interface QueueStatus {
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
}

export interface QueueJob {
    id: string;
    name: string;
    data: Record<string, unknown>;
    status: string;
    progress?: number;
    timestamp: number;
    processedOn?: number;
    finishedOn?: number;
    failedReason?: string;
}
