import { ApiError, ApiErrorPayload } from '../types/api';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  'http://localhost:3001/api/v1';

/**
 * Access token held strictly in JavaScript memory closure.
 * Never written to localStorage, sessionStorage, or logs.
 */
let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
};

// Listeners for auth expiration/failure events
type AuthListener = () => void;
const authExpiredListeners: Set<AuthListener> = new Set();

export const onAuthExpired = (listener: AuthListener) => {
  authExpiredListeners.add(listener);
  return () => {
    authExpiredListeners.delete(listener);
  };
};

const notifyAuthExpired = () => {
  clearAccessToken();
  authExpiredListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      // Ignore listener error
    }
  });
};

/**
 * Single shared refresh promise to prevent concurrent refresh storms
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refreshes session via POST /auth/refresh with HttpOnly cookie.
 * Returns new access token or null if refresh failed.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Sends HttpOnly refreshToken cookie
      });

      if (!response.ok) {
        clearAccessToken();
        return null;
      }

      const data = await response.json();
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken as string;
      }

      clearAccessToken();
      return null;
    } catch {
      clearAccessToken();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface RequestOptions extends RequestInit {
  _retry?: boolean;
}

/**
 * Robust fetch wrapper with in-memory token injection, single refresh deduplication,
 * and RFC 7807 structured error parsing.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const isRefreshCall = endpoint.includes('/auth/refresh');
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject in-memory access token if available and not explicitly overridden
  if (inMemoryAccessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are sent with every request
  };

  const response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized with token refresh (Retry once, deduplicated)
  if (response.status === 401 && !options._retry && !isRefreshCall) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry original request once with new token
      return apiRequest<T>(endpoint, {
        ...options,
        _retry: true,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } else {
      // Refresh failed -> clear session and notify subscribers
      notifyAuthExpired();
    }
  }

  // Handle responses
  if (!response.ok) {
    let errorPayload: ApiErrorPayload;
    try {
      errorPayload = await response.json();
    } catch {
      errorPayload = {
        statusCode: response.status,
        message: response.statusText || 'An unexpected error occurred',
      };
    }
    throw new ApiError(errorPayload);
  }

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
