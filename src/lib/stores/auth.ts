import { writable } from "svelte/store";
import { browser } from "$app/environment";
import type { Admin } from "$lib/types";
import {
  api,
  clearSessionCookie,
  clearToken,
  getToken,
  setSessionCookie,
  setToken,
} from "$lib/api/client";

interface AuthState {
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
      if (window.location.pathname === "/login") {
        set({ admin: null, isLoading: false });
        return;
      }
      if (!getToken()) {
        set({ admin: null, isLoading: false });
        return;
      }
      try {
        const response = await api.get("/auth/me");
        const admin = response?.data?.admin || response?.data?.data?.admin;
        if (admin) {
          set({ admin, isLoading: false });
        } else {
          clearToken();
          set({ admin: null, isLoading: false });
        }
      } catch (error) {
        clearToken();
        set({ admin: null, isLoading: false });
      }
    },
    login: (admin: Admin, token: string) => {
      setToken(token);
      setSessionCookie(token);
      set({ admin, isLoading: false });
    },
    logout: async () => {
      clearToken();
      clearSessionCookie();
      if (browser) {
        try {
          await api.post("/auth/logout");
        } catch (e) {
          // Ignore errors on logout
        }
      }
      set({ admin: null, isLoading: false });
      if (browser) {
        window.location.href = "/login";
      }
    },
    setLoading: (isLoading: boolean) => {
      update((state) => ({ ...state, isLoading }));
    },
  };
}

export const authStore = createAuthStore();
