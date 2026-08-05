import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Admin } from '$lib/types';
import { api } from '$lib/api/client';

export interface AuthState {
    admin: Admin | null;
    isLoading: boolean;
}

function createAuthStore() {
    const initialState: AuthState = {
        admin: null,
        isLoading: true,
    };

    const { subscribe, set, update } = writable<AuthState>(initialState);

    return {
        subscribe,
        init: async () => {
            if (!browser) return;
            if (window.location.pathname === '/login') {
                set({ admin: null, isLoading: false });
                return;
            }
            try {
                const response = await api.get('/auth/me');
                if (response?.data?.admin) {
                    set({ admin: response.data.admin, isLoading: false });
                } else {
                    set({ admin: null, isLoading: false });
                }
            } catch (error) {
                set({ admin: null, isLoading: false });
            }
        },
        login: (admin: Admin) => {
            set({ admin, isLoading: false });
        },
        logout: async () => {
            if (browser) {
                try {
                    await api.post('/auth/logout');
                } catch (e) {
                    // Ignore errors on logout
                }
            }
            set({ admin: null, isLoading: false });
            if (browser) {
                window.location.href = '/login';
            }
        },
        setLoading: (isLoading: boolean) => {
            update((state) => ({ ...state, isLoading }));
        },
    };
}

export const authStore = createAuthStore();

// Derived store for checking authentication
export const isAuthenticated = derived(authStore, ($auth) => !!$auth.admin);
