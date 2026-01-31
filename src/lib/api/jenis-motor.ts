import api from './axios';
import type { JenisMotor, PaginationMeta } from '$lib/types';

export const jenisMotorApi = {
    getAll: async (filter?: { page?: number; limit?: number; search?: string }): Promise<{ data: JenisMotor[]; meta: PaginationMeta }> => {
        const { data: body } = await api.get('/jenis-motor', { params: filter });
        return { data: body.data, meta: body.meta };
    },
    getById: async (id: string): Promise<JenisMotor> => {
        const { data: body } = await api.get(`/jenis-motor/${id}`);
        return body.data;
    },
    create: async (jenisMotor: FormData): Promise<JenisMotor> => {
        const { data: body } = await api.post('/jenis-motor', jenisMotor, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return body.data;
    },
    update: async (id: string, jenisMotor: FormData): Promise<JenisMotor> => {
        const { data: body } = await api.patch(`/jenis-motor/${id}`, jenisMotor, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return body.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/jenis-motor/${id}`);
    },
};
