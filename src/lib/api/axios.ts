import axios from 'axios';
import { browser } from '$app/environment';
import { toast } from '$lib/stores/toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3030/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        if (browser) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Success Toast for mutations (POST, PUT, DELETE, PATCH)
        const method = response.config.method?.toUpperCase();
        if (browser && method !== 'GET' && response.data?.message) {
            const type = response.data.type || 'success';
            toast.add(response.data.message, type as any);
        }
        return response;
    },
    (error) => {
        if (browser) {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message || 'Terjadi kesalahan sistem';

            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
                window.location.href = '/login';
            } else {
                toast.error(message);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
