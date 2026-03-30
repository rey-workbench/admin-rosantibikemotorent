export interface Admin {
    id: string;
    username: string;
    nama: string;
    email?: string;
    createdAt?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    admin: Admin;
    token: string;
    message: string;
}

export interface AuthState {
    admin: Admin | null;
    token: string | null;
    isLoading: boolean;
}
