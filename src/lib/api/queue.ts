import type { QueueStatus } from '$lib/types';
import { api } from './client';

export const queueApi = {
	getStatus: async (): Promise<QueueStatus[]> => {
		const { data } = await api.get('/debug/queue/status');
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
	}
};
