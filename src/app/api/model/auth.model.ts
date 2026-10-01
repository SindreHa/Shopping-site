export interface LoginRequest {
    username: string;
    password: string;
}

export interface AdminSession {
    token: string;
    username: string;
    expiresAt: string;
}
