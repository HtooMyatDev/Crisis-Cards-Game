// API response type definitions

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errors?: Record<string, string | null>;
}

export interface ApiError {
    error: string;
    code?: string;
    details?: unknown;
}

export interface ValidationError {
    field: string;
    message: string;
}
