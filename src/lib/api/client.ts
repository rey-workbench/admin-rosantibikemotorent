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

function buildUrl(url: string, params?: any): string {
    let fetchUrl = `${API_BASE_URL}${url}`;
    if (!params) return fetchUrl;

    const searchParams = new URLSearchParams();
    for (const key in params) {
        const val = params[key];
        if (val !== undefined && val !== null) {
            searchParams.append(key, String(val));
        }
    }
    const qs = searchParams.toString();
    return qs ? `${fetchUrl}?${qs}` : fetchUrl;
}

function buildHeadersAndBody(data?: any, customHeaders?: any) {
    const headers: Record<string, string> = {
        ...(customHeaders || {})
    };

    if (browser) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    let body = undefined;
    if (data !== undefined && data !== null) {
        if (data instanceof FormData) {
            body = data;
        } else {
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
            body = JSON.stringify(data);
        }
    }
    return { headers, body };
}

async function parseResponse(response: Response, url: string, method: string) {
    const contentType = response.headers.get('content-type');
    const responseData = contentType && contentType.includes('application/json')
        ? await response.json()
        : await response.text();

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
        const successMsg = responseData.userErrorMsg || responseData.message;
        toast.add(successMsg, type as any);
    }

    return { data: responseData, status: response.status };
}

function handleError(error: any) {
    if (browser) {
        const status = error.response?.status;
        const message = error.response?.data?.userErrorMsg || error.response?.data?.message;

        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            window.location.href = '/login';
        } else if (message) {
            toast.error(message);
        }
    }
    throw error;
}

class ApiClient {
    async request(method: string, url: string, data?: any, config: any = {}) {
        const fetchUrl = buildUrl(url, config.params);
        const { headers, body } = buildHeadersAndBody(data, config.headers);

        try {
            const response = await fetch(fetchUrl, {
                method,
                headers,
                body
            });
            return await parseResponse(response, url, method);
        } catch (error: any) {
            handleError(error);
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
