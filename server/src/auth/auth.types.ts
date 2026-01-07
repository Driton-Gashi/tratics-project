export interface RegisterRequest {
  email: string;
  username?: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string | null;
  password_hash: string;
  role: 'user' | 'admin';
  is_active: number;
  created_at: Date;
  updated_at: Date | null;
}

export interface UserSession {
  id: number;
  user_id: number;
  refresh_token_hash: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export interface AuthResponse {
  ok: boolean;
  data?: {
    user: {
      id: number;
      email: string;
      username: string | null;
      role: 'user' | 'admin';
    };
  };
  message?: string;
  details?: unknown;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}
