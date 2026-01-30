import api from './axios';
import type {
    Admin,
    AuthResponse,
    LoginCredentials,
    JenisMotor,
    UnitMotor,
    Transaksi,
    BlogPost,
    BlogKategori,
    BlogTag,
    WhatsappStatus,
    QueueStatus,
    QueueJob,
    PaginationMeta
} from '$lib/types';

// Auth API
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data: body } = await api.post('/auth/login', credentials);
        return body.data;
    },
    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },
    getProfile: async (): Promise<{ admin: Admin }> => {
        const { data: body } = await api.get('/auth/me');
        return body.data;
    },
};

// Admin API
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

// Jenis Motor API
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

// Unit Motor API
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

// Transaksi API
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

// Blog API
export const blogApi = {
    getAll: async (filter?: { page?: number; limit?: number; status?: string; kategoriId?: string }): Promise<{ data: BlogPost[]; meta: PaginationMeta }> => {
        const { data } = await api.get('/blog', { params: filter });
        return { data: data.data, meta: data.meta };
    },
    getById: async (id: string): Promise<BlogPost> => {
        const { data } = await api.get(`/blog/${id}`);
        return data.data || data;
    },
    getKategori: async (): Promise<BlogKategori[]> => {
        const { data } = await api.get('/blog/kategori');
        return data.data;
    },
    getTags: async (): Promise<BlogTag[]> => {
        const { data } = await api.get('/blog/tags');
        return data.data;
    },
    create: async (blog: FormData): Promise<BlogPost> => {
        const { data } = await api.post('/blog', blog, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data || data;
    },
    update: async (id: string, blog: FormData): Promise<BlogPost> => {
        const { data } = await api.patch(`/blog/${id}`, blog, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data || data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/blog/${id}`);
    },
};

// WhatsApp API
export const whatsappApi = {
    getStatus: async (): Promise<WhatsappStatus> => {
        const { data } = await api.get('/whatsapp/session-status');
        return data.data || data;
    },
    getQrCode: async (): Promise<{ qrcode: string | null }> => {
        const { data } = await api.get('/whatsapp/qrcode');
        return data.data || data;
    },
    startSession: async (): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/start-all');
        return data.data || data;
    },
    resetSession: async (): Promise<unknown> => {
        const { data } = await api.get('/whatsapp/reset-session');
        return data.data || data;
    },
    logout: async (): Promise<void> => {
        await api.post('/whatsapp/logout-session');
    },
    sendMessage: async (to: string, message: string): Promise<unknown> => {
        const { data } = await api.post('/whatsapp/send-message', { to, message });
        return data.data || data;
    },
};

// Queue API
export const queueApi = {
    getStatus: async (): Promise<QueueStatus[]> => {
        const { data } = await api.get('/debug/queue/status');
        return data.data;
    },
    getQueueStatus: async (queueName: string): Promise<QueueStatus> => {
        const { data } = await api.get(`/debug/queue/${queueName}/status`);
        return data.data;
    },
    getJobs: async (queueName: string, status: string = 'waiting', start?: number, size?: number): Promise<QueueJob[]> => {
        const { data } = await api.get(`/debug/queue/${queueName}/jobs`, { params: { status, start, size } });
        return data.data;
    },
    retryJob: async (queueName: string, jobId: string): Promise<void> => {
        await api.post(`/debug/queue/${queueName}/jobs/${jobId}/retry`);
    },
    removeJob: async (queueName: string, jobId: string): Promise<void> => {
        await api.delete(`/debug/queue/${queueName}/jobs/${jobId}`);
    },
    cleanQueue: async (queueName: string, status: string = 'completed'): Promise<void> => {
        await api.delete(`/debug/queue/${queueName}/clean`, { params: { status } });
    },
    pauseQueue: async (queueName: string): Promise<void> => {
        await api.post(`/debug/queue/${queueName}/pause`);
    },
    resumeQueue: async (queueName: string): Promise<void> => {
        await api.post(`/debug/queue/${queueName}/resume`);
    },
};

// Redis API
export const redisApi = {
    ping: async (): Promise<{ message: string }> => {
        const { data } = await api.get('/debug/redis/ping');
        return data.data || data;
    },
    getInfo: async (): Promise<{ info: string }> => {
        const { data } = await api.get('/debug/redis/info');
        return data.data || data;
    },
    getKeys: async (pattern: string = '*'): Promise<string[]> => {
        const { data } = await api.get('/debug/redis/keys', { params: { pattern } });
        return data.data;
    },
};
