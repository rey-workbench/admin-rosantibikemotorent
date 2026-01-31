import api from './axios';
import type { UnitMotor, PaginationMeta } from '$lib/types';

export const unitMotorApi = {
    getAll: async (filter?: { page?: number; limit?: number; status?: string; jenisId?: string }): Promise<{ data: UnitMotor[]; meta: PaginationMeta }> => {
        const { data: body } = await api.get('/unit-motor', { params: filter });
        return { data: body.data, meta: body.meta };
    },
    getById: async (id: string): Promise<UnitMotor> => {
        const { data: body } = await api.get(`/unit-motor/${id}`);
        return body.data;
    },
    getBrands: async (): Promise<{ id: string; merk: string }[]> => {
        const { data: body } = await api.get('/unit-motor/brands');
        return body.data;
    },
    checkAvailability: async (params: { startDate: string; endDate: string; unitId?: string }): Promise<unknown> => {
        const { data: body } = await api.get('/unit-motor/availability', { params });
        return body.data;
    },
    create: async (unitMotor: Partial<UnitMotor>): Promise<UnitMotor> => {
        const { data: body } = await api.post('/unit-motor', unitMotor);
        return body.data;
    },
    update: async (id: string, unitMotor: Partial<UnitMotor>): Promise<UnitMotor> => {
        const { data: body } = await api.patch(`/unit-motor/${id}`, unitMotor);
        return body.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/unit-motor/${id}`);
    },
};
