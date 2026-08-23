import type { BlogPost, PaginationMeta } from '$lib/types';
import { api } from './client';

export const blogApi = {
	getAll: async (filter?: {
		page?: number;
		limit?: number;
		status?: string;
		kategoriId?: string;
	}): Promise<{ data: BlogPost[]; meta: PaginationMeta }> => {
		const { data } = await api.get('/blog', { params: filter });
		return { data: data.data, meta: data.meta };
	},
	getById: async (id: string): Promise<BlogPost> => {
		const { data } = await api.get(`/blog/${id}`);
		return data.data;
	},
	create: async (blog: FormData): Promise<BlogPost> => {
		const { data } = await api.post('/blog', blog, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return data.data;
	},
	update: async (id: string, blog: FormData): Promise<BlogPost> => {
		const { data } = await api.patch(`/blog/${id}`, blog, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return data.data;
	},
	delete: async (id: string): Promise<void> => {
		await api.delete(`/blog/${id}`);
	}
};
