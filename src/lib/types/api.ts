export interface ApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
