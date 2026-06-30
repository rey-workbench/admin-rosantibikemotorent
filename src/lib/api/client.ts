import { browser } from '$app/environment';
import { toast } from '$lib/stores/toast';

let rawUrl = import.meta.env.VITE_API_URL;
if (!rawUrl) {
    if (browser) {
        rawUrl = `${window.location.protocol}//${window.location.hostname}:3030/api`;
    } else {
        rawUrl = 'http://localhost:3030/api';
    }
}
const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

class ApiClient {
    async request(method: string, url: string, data?: any, config: any = {}) {
        let fetchUrl = `${API_BASE_URL}${url}`;
        
        if (config.params) {
            const searchParams = new URLSearchParams();
            for (const key in config.params) {
                if (config.params[key] !== undefined && config.params[key] !== null) {
                    searchParams.append(key, String(config.params[key]));
                }
            }
            const qs = searchParams.toString();
            if (qs) {
                fetchUrl += `?${qs}`;
            }
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(config.headers || {})
        };

        if (browser) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        let body = undefined;
        if (data) {
            if (data instanceof FormData) {
                delete headers['Content-Type'];
                body = data;
            } else {
                body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(fetchUrl, {
                method,
                headers,
                body
            });

            let responseData: any;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                const error: any = new Error(responseData?.message || 'Request failed');
                error.response = {
                    status: response.status,
                    data: responseData
                };
                throw error;
            }

            const isWhatsapp = url.includes('/whatsapp');
            if (browser && method !== 'GET' && responseData?.message && !isWhatsapp) {
                const type = responseData.type || 'success';
                toast.add(responseData.message, type as any);
            }

            return { data: responseData, status: response.status };
        } catch (error: any) {
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
            throw error;
        }
    }

    get(url: string, config?: any) { return this.request('GET', url, undefined, config); }
    post(url: string, data?: any, config?: any) { return this.request('POST', url, data, config); }
    put(url: string, data?: any, config?: any) { return this.request('PUT', url, data, config); }
    patch(url: string, data?: any, config?: any) { return this.request('PATCH', url, data, config); }
    delete(url: string, config?: any) { return this.request('DELETE', url, undefined, config); }
}

export const api = new ApiClient();
export default api;
