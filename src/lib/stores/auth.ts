import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { api, clearToken } from '$lib/api/client';
import type { Admin } from '$lib/types';

interface AuthState {
	admin: Admin | null;
	isLoading: boolean;
}

function createAuthStore() {
	const initialState: AuthState = {
		admin: null,
		isLoading: true
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
			// Token dikirim otomatis via httpOnly cookie (credentials: include)
			try {
				const response = await api.get('/auth/me');
				const admin = response?.data?.admin || response?.data?.data?.admin;
				if (admin) {
					set({ admin, isLoading: false });
				} else {
					set({ admin: null, isLoading: false });
				}
			} catch (error) {
				set({ admin: null, isLoading: false });
			}
		},
		login: (admin: Admin, _token: string) => {
			// Token tidak disimpan di JS — httpOnly cookie sudah di-set backend
			set({ admin, isLoading: false });
		},
		logout: async () => {
			if (browser) {
				try {
					await api.post('/auth/logout'); // backend clear httpOnly cookie
				} catch (e) {
					// Ignore errors on logout
				}
			}
			clearToken(); // bersihkan sisa legacy storage
			set({ admin: null, isLoading: false });
			if (browser) {
				window.location.href = '/login';
			}
		},
		setLoading: (isLoading: boolean) => {
			update((state) => ({ ...state, isLoading }));
		}
	};
}

export const authStore = createAuthStore();
