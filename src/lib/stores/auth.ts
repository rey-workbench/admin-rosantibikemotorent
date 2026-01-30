import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Admin } from '$lib/types';

interface AuthState {
    admin: Admin | null;
    token: string | null;
    isLoading: boolean;
}

function createAuthStore() {
    const initialState: AuthState = {
        admin: null,
        token: null,
        isLoading: true,
    };

    const { subscribe, set, update } = writable<AuthState>(initialState);

    // Initialize from localStorage on browser
    if (browser) {
        const storedToken = localStorage.getItem('token');
        const storedAdmin = localStorage.getItem('admin');

        if (storedToken && storedAdmin) {
            try {
                set({
                    token: storedToken,
                    admin: JSON.parse(storedAdmin),
                    isLoading: false,
                });
            } catch {
                set({ ...initialState, isLoading: false });
            }
        } else {
            set({ ...initialState, isLoading: false });
        }
    }

    return {
        subscribe,
        login: (admin: Admin, token: string) => {
            if (browser) {
                localStorage.setItem('token', token);
                localStorage.setItem('admin', JSON.stringify(admin));
            }
            set({ admin, token, isLoading: false });
        },
        logout: () => {
            if (browser) {
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
            }
            set({ admin: null, token: null, isLoading: false });
        },
        setLoading: (isLoading: boolean) => {
            update((state) => ({ ...state, isLoading }));
        },
    };
}

export const authStore = createAuthStore();

// Derived store for checking authentication
export const isAuthenticated = derived(authStore, ($auth) => !!$auth.token && !!$auth.admin);
