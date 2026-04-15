import api from './axios';
import type { AiKnowledge, AiKnowledgeDto, AiTestRequest, AiTestResponse } from '$lib/types';

export const aiApi = {
    test: async (req: AiTestRequest): Promise<AiTestResponse> => {
        const { data } = await api.post('/ai/test', req);
        return data.data;
    },
    getKnowledge: async (category?: string): Promise<AiKnowledge[]> => {
        const { data } = await api.get('/ai/knowledge', { params: { category } });
        return data.data;
    },
    createKnowledge: async (dto: AiKnowledgeDto): Promise<AiKnowledge> => {
        const { data } = await api.post('/ai/knowledge', dto);
        return data.data;
    },
    updateKnowledge: async (id: string, dto: Partial<AiKnowledgeDto>): Promise<AiKnowledge> => {
        const { data } = await api.put(`/ai/knowledge/${id}`, dto);
        return data.data;
    },
    deleteKnowledge: async (id: string): Promise<{ success: boolean }> => {
        const { data } = await api.delete(`/ai/knowledge/${id}`);
        return data.data;
    }
};
