import api from './axios';
import type { Admin } from '$lib/types';

export const adminApi = {
    getAll: async (): Promise<Admin[]> => {
        const { data: body } = await api.get('/admin');
        return body.data;
    },
    getById: async (id: string): Promise<Admin> => {
        const { data: body } = await api.get(`/admin/${id}`);
        return body.data;
    },
    create: async (adminData: Partial<Admin> & { password: string }): Promise<Admin> => {
        const { data: body } = await api.post('/admin', adminData);
        return body.data;
    },
    update: async (id: string, adminData: Partial<Admin>): Promise<Admin> => {
        const { data: body } = await api.put(`/admin/${id}`, adminData);
        return body.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/admin/${id}`);
    },
};
