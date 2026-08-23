type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
	id: string;
	message: string;
	type: ToastType;
}

import { writable } from 'svelte/store';

function createToastStore() {
	const { subscribe, update } = writable<ToastMessage[]>([]);

	return {
		subscribe,
		add: (message: string, type: ToastType = 'info', duration = 3000) => {
			const id = Math.random().toString(36).substr(2, 9);
			const toast = { id, message, type };
			update((toasts) => [...toasts, toast]);

			if (duration > 0) {
				setTimeout(() => {
					update((toasts) => toasts.filter((t) => t.id !== id));
				}, duration);
			}
		},
		remove: (id: string) => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		},
		success: (...args: any[]) =>
			toast.add(
				args.map((a) => (typeof a === 'string' ? a : a?.message || String(a))).join(' '),
				'success',
				3000
			),
		error: (...args: any[]) =>
			toast.add(
				args.map((a) => (typeof a === 'string' ? a : a?.message || String(a))).join(' '),
				'error',
				3000
			),
		info: (...args: any[]) =>
			toast.add(
				args.map((a) => (typeof a === 'string' ? a : a?.message || String(a))).join(' '),
				'info',
				3000
			),
		warning: (...args: any[]) =>
			toast.add(
				args.map((a) => (typeof a === 'string' ? a : a?.message || String(a))).join(' '),
				'warning',
				3000
			)
	};
}

export const toast = createToastStore();
