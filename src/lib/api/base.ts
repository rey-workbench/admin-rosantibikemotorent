import api from './axios';
import type { PaginationMeta, PaginatedResponse } from '$lib/types';

export interface CRUDOptions<T> {
    endpoint: string;
    pluralEndpoint?: string;
}

export interface CRUDMethods<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
    getAll: (filter?: Record<string, unknown>) => Promise<PaginatedResponse<T>>;
    getById: (id: string) => Promise<T>;
    create: (data: TCreate) => Promise<T>;
    update: (id: string, data: TUpdate) => Promise<T>;
    delete: (id: string) => Promise<void>;
    getBySlug?: (slug: string) => Promise<T>;
}

export function createCRUD<T, TCreate = Partial<T>, TUpdate = Partial<T>>(
    options: CRUDOptions<T>
): CRUDMethods<T, TCreate, TUpdate> {
    const { endpoint, pluralEndpoint = endpoint } = options;

    return {
        async getAll(filter?: Record<string, unknown>): Promise<PaginatedResponse<T>> {
            const { data: body } = await api.get(pluralEndpoint, { params: filter });
            return { data: body.data, meta: body.meta };
        },

        async getById(id: string): Promise<T> {
            const { data: body } = await api.get(`${endpoint}/${id}`);
            return body.data;
        },

        async create(data: TCreate): Promise<T> {
            const { data: body } = await api.post(endpoint, data);
            return body.data;
        },

        async update(id: string, data: TUpdate): Promise<T> {
            const { data: body } = await api.patch(`${endpoint}/${id}`, data);
            return body.data;
        },

        async delete(id: string): Promise<void> {
            await api.delete(`${endpoint}/${id}`);
        },
    };
}

export interface FormDataCRUDOptions<T> extends CRUDOptions<T> {
    formDataFields?: string[];
}

export function createFormDataCRUD<T, TCreate = Partial<T>, TUpdate = Partial<T>>(
    options: FormDataCRUDOptions<T>
): CRUDMethods<T, TCreate, TUpdate> {
    const baseCRUD = createCRUD<T, TCreate, TUpdate>(options);

    return {
        ...baseCRUD,

        async create(data: TCreate): Promise<T> {
            const formData = new FormData();
            Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
                if (value instanceof File) {
                    formData.append(key, value);
                } else if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });
            const { data: body } = await api.post(options.endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return body.data;
        },

        async update(id: string, data: TUpdate): Promise<T> {
            const formData = new FormData();
            Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
                if (value instanceof File) {
                    formData.append(key, value);
                } else if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });
            const { data: body } = await api.patch(`${options.endpoint}/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return body.data;
        },
    };
}
