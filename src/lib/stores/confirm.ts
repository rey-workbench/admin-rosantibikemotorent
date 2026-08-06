interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  type?: "info" | "warning" | "danger" | "success";
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: (value: boolean) => void;
}
import { writable } from "svelte/store";

function createConfirmStore() {
  const { subscribe, set, update } = writable<ConfirmState>({
    open: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "Konfirmasi",
    cancelText: "Batal",
    resolve: () => {},
  });

  return {
    subscribe,
    show: (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        set({
          open: true,
          title: options.title,
          message: options.message,
          type: options.type || "info",
          confirmText: options.confirmText || "Konfirmasi",
          cancelText: options.cancelText || "Batal",
          resolve,
        });
      });
    },
    confirm: () => {
      update((state) => {
        state.resolve(true);
        return { ...state, open: false };
      });
    },
    cancel: () => {
      update((state) => {
        state.resolve(false);
        return { ...state, open: false };
      });
    },
  };
}

export const confirm = createConfirmStore();
