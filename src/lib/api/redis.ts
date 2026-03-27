import api from './axios';

export const redisApi = {
    ping: async (): Promise<{ message: string }> => {
        const { data } = await api.get('/debug/redis/ping');
        return data.data;
    },
    getInfo: async (): Promise<{ info: string }> => {
        const { data } = await api.get('/debug/redis/info');
        return data.data;
    },
    getKeys: async (pattern: string = '*'): Promise<string[]> => {
        const { data } = await api.get('/debug/redis/keys', { params: { pattern } });
        return data.data;
    },
};
