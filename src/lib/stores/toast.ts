import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

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
        success: (msg: string, duration = 3000) => toast.add(msg, 'success', duration),
        error: (msg: string, duration = 3000) => toast.add(msg, 'error', duration),
        info: (msg: string, duration = 3000) => toast.add(msg, 'info', duration),
        warning: (msg: string, duration = 3000) => toast.add(msg, 'warning', duration),
    };
}

export const toast = createToastStore();
