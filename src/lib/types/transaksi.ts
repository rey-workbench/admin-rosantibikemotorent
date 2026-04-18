export type StatusTransaksi = 'PENDING_DP' | 'PENDING' | 'DP_DIBAYAR' | 'LUNAS' | 'AKTIF' | 'BATAL' | 'SELESAI' | 'OVERDUE';

export interface Transaksi {
    id: string;
    namaPenyewa: string;
    noWhatsapp: string;
    noKTP?: string;
    unitId: string;
    unitMotor?: import('./motor').UnitMotor;
    tanggalMulai: string;
    tanggalSelesai: string;
    jamMulai: string;
    jamSelesai: string;
    durasiHari: number;
    helm: number;
    jasHujan: number;
    totalBiaya: number;
    status: StatusTransaksi;
    createdAt: string;
    updatedAt: string;
    biayaDenda?: number;
    dpAmount?: number;
}

export interface TransaksiEvent {
    id: string;
    namaPenyewa: string;
    noWhatsapp: string;
    tanggalMulai: Date;
    tanggalSelesai: Date;
    totalBiaya: number;
    status: string;
    unitMotor: {
        id: string;
        platNomor: string;
        jenis: {
            model: string;
            merk: string;
        };
    };
    biayaDenda?: number;
}

export interface CreateTransaksiParams extends Partial<Transaksi> {
    generateQRISOnly?: boolean;
}

export interface CalculatePriceParams {
    unitId: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    jamMulai: string;
    jamSelesai: string;
    helm?: number;
    jasHujan?: number;
}

export interface CalculatePriceResponse {
    totalBiaya: number;
}
