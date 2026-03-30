import { TRANSAKSI_STATUS_VARIANTS, MOTOR_STATUS_VARIANTS } from '$lib/constants';

const STATUS_COLORS: Record<string, string> = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
    default: 'text-gray-600',
};

const STATUS_DOT_COLORS: Record<string, string> = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-gray-500',
};

export function getStatusColor(status: string): string {
    const statusUpper = status.toUpperCase();
    if (statusUpper in TRANSAKSI_STATUS_VARIANTS) {
        return STATUS_COLORS[TRANSAKSI_STATUS_VARIANTS[statusUpper]] || STATUS_COLORS.default;
    }
    if (statusUpper in MOTOR_STATUS_VARIANTS) {
        return STATUS_COLORS[MOTOR_STATUS_VARIANTS[statusUpper]] || STATUS_COLORS.default;
    }
    return STATUS_COLORS.default;
}

export function getStatusDot(status: string): string {
    const statusUpper = status.toUpperCase();
    if (statusUpper in TRANSAKSI_STATUS_VARIANTS) {
        return STATUS_DOT_COLORS[TRANSAKSI_STATUS_VARIANTS[statusUpper]] || STATUS_DOT_COLORS.default;
    }
    if (statusUpper in MOTOR_STATUS_VARIANTS) {
        return STATUS_DOT_COLORS[MOTOR_STATUS_VARIANTS[statusUpper]] || STATUS_DOT_COLORS.default;
    }
    return STATUS_DOT_COLORS.default;
}
