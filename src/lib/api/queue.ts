import api from './axios';
import type { QueueStatus, QueueJob } from '$lib/types';

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
    cancelJob: async (queueName: string, jobId: string, reason?: string): Promise<{ ok: boolean; mode: string; state: string; reason: string }> => {
        const { data } = await api.post(`/debug/queue/${queueName}/jobs/${jobId}/cancel`, {
            reason,
        });
        return data.data;
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
