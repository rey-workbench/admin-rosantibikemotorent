export const STATUS_TRANSAKSI = {
  PENDING_DP: "PENDING_DP",
  PENDING: "PENDING",
  DP_DIBAYAR: "DP_DIBAYAR",
  LUNAS: "LUNAS",
  AKTIF: "AKTIF",
  BATAL: "BATAL",
  SELESAI: "SELESAI",
  OVERDUE: "OVERDUE",
} as const;

export const STATUS_ARTIKEL = {
  DRAFT: "DRAFT",
  TERBIT: "TERBIT",
} as const;

const STATUS_VARIANTS = {
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
  INFO: "info",
  DEFAULT: "default",
} as const;

export type BadgeVariant =
  (typeof STATUS_VARIANTS)[keyof typeof STATUS_VARIANTS];

export const TRANSAKSI_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PENDING_DP: "warning",
  PENDING: "warning",
  DP_DIBAYAR: "info",
  LUNAS: "success",
  AKTIF: "info",
  BATAL: "default",
  SELESAI: "success",
  OVERDUE: "danger",
} as const;

export const MOTOR_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  AVAILABLE: "success",
  RENTED: "info",
  MAINTENANCE: "warning",
} as const;
