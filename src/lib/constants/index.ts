export const STATUS_MOTOR = {
    TERSEDIA: 'TERSEDIA',
    DISEWA: 'DISEWA',
    PERBAIKAN: 'PERBAIKAN',
    DIPESAN: 'DIPESAN',
    OVERDUE: 'OVERDUE',
} as const;

export const STATUS_TRANSAKSI = {
    PENDING: 'PENDING',
    AKTIF: 'AKTIF',
    SELESAI: 'SELESAI',
    OVERDUE: 'OVERDUE',
    DIBATALKAN: 'DIBATALKAN',
} as const;

export const STATUS_ARTIKEL = {
    DRAFT: 'DRAFT',
    TERBIT: 'TERBIT',
} as const;

export const WHATSAPP_STATUS = {
    CONNECTED: 'connected',
    CONNECTING: 'connecting',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
    QR_TIMEOUT: 'qr_timeout',
} as const;

export const API_ENDPOINTS = {
    AUTH: '/auth',
    ADMIN: '/admin',
    JENIS_MOTOR: '/jenis-motor',
    UNIT_MOTOR: '/unit-motor',
    TRANSAKSI: '/transaksi',
    BLOG: '/blog',
    WHATSAPP: '/whatsapp',
    QUEUE: '/debug/queue',
    REDIS: '/debug/redis',
} as const;

export const TOAST_DURATION = {
    SHORT: 1500,
    DEFAULT: 3000,
    LONG: 5000,
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

export const STATUS_VARIANTS = {
    SUCCESS: 'success',
    WARNING: 'warning',
    DANGER: 'danger',
    INFO: 'info',
    DEFAULT: 'default',
} as const;

export type BadgeVariant = typeof STATUS_VARIANTS[keyof typeof STATUS_VARIANTS];

export const TRANSAKSI_STATUS_VARIANTS: Record<string, BadgeVariant> = {
    PENDING: 'warning',
    AKTIF: 'info',
    SELESAI: 'success',
    OVERDUE: 'danger',
    DIBATALKAN: 'default',
} as const;

export const MOTOR_STATUS_VARIANTS: Record<string, BadgeVariant> = {
    TERSEDIA: 'success',
    DISEWA: 'info',
    PERBAIKAN: 'warning',
    DIPESAN: 'info',
    OVERDUE: 'danger',
} as const;
