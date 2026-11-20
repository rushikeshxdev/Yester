import { apiRequest, setAccessToken, clearAccessToken } from './client';
import { AuthUser, AuthResponse } from '../types/api';

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  /**
   * Register a new user account.
   * Access token is returned and stored in memory.
   * Refresh token cookie is set by server.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAccessToken(data.accessToken);
    return data;
  },

  /**
   * Login with email and password.
   * Stores access token in memory.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAccessToken(data.accessToken);
    return data;
  },

  /**
   * Refresh active session using HttpOnly cookie.
   * Sets new access token in memory.
   */
  async refresh(): Promise<{ accessToken: string } | null> {
    try {
      const data = await apiRequest<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
      });
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        return data;
      }
      clearAccessToken();
      return null;
    } catch {
      clearAccessToken();
      return null;
    }
  },

  /**
   * Logout session server-side, clearing cookie and in-memory token.
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearAccessToken();
    }
  },

  /**
   * Get current authenticated user profile.
   */
  async getMe(): Promise<AuthUser> {
    return apiRequest<AuthUser>('/auth/me', {
      method: 'GET',
    });
  },
};
