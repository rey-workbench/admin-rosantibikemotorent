import api from './axios';
import type { Transaksi, PaginationMeta } from '$lib/types';

export const transaksiApi = {
    getAll: async (filter?: { page?: number; limit?: number; status?: string[] }): Promise<{ data: Transaksi[]; meta: PaginationMeta }> => {
        const { data: body } = await api.get('/transaksi', { params: filter });
        return { data: body.data, meta: body.meta };
    },
    getHistory: async (filter?: { page?: number; limit?: number }): Promise<{ data: Transaksi[]; meta: PaginationMeta }> => {
        const { data: body } = await api.get('/transaksi/history', { params: filter });
        return { data: body.data, meta: body.meta };
    },
    getById: async (id: string): Promise<Transaksi & { qrisBase64?: string }> => {
        const { data: body } = await api.get(`/transaksi/${id}`);
        return body.data;
    },
    searchByPhone: async (noWhatsapp: string): Promise<Transaksi[]> => {
        const { data: body } = await api.get('/transaksi/search', { params: { noHP: noWhatsapp } });
        return body.data;
    },
    create: async (transaksi: Partial<Transaksi> & { generateQRISOnly?: boolean }): Promise<Transaksi & { qrisBase64?: string }> => {
        const { data: body } = await api.post('/transaksi', transaksi);
        return body.data;
    },
    update: async (id: string, transaksi: Partial<Transaksi>): Promise<Transaksi> => {
        const { data: body } = await api.patch(`/transaksi/${id}`, transaksi);
        return body.data;
    },
    selesaiSewa: async (id: string): Promise<Transaksi> => {
        const { data: body } = await api.post(`/transaksi/${id}/selesai`);
        return body.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/transaksi/${id}`);
    },
    calculatePrice: async (params: { unitId: string; tanggalMulai: string; tanggalSelesai: string; jamMulai: string; jamSelesai: string; helm?: number; jasHujan?: number }): Promise<{ totalBiaya: number }> => {
        const { data: body } = await api.post('/transaksi/calculate-price', params);
        return body.data;
    },
};
