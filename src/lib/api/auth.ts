import api from './axios';
import type { LoginCredentials, AuthResponse, Admin } from '$lib/types';

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data: body } = await api.post('/auth/login', credentials);
        return body;
    },
    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },
    getProfile: async (): Promise<{ admin: Admin }> => {
        const { data: body } = await api.get('/auth/me');
        return body;
    },
};
