import { api } from "./client";
import type { LoginCredentials, AuthResponse } from "$lib/types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data: body } = await api.post("/auth/login", credentials);
    return body.data;
  },
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
