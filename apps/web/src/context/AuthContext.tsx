import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthUser } from '../types/api';
import { authApi } from '../api/auth.api';
import { onAuthExpired, clearAccessToken } from '../api/client';

export type VaultMode = 'personal' | 'sovereign';

interface AuthContextType {
  user: AuthUser | null;
  mode: VaultMode;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  setMode: (mode: VaultMode) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<VaultMode>('personal');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Bootstrap lifecycle: Check for existing session via HttpOnly cookie
  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const refreshResult = await authApi.refresh();
        if (refreshResult?.accessToken && isMounted) {
          const profile = await authApi.getMe();
          if (isMounted) {
            setUser(profile);
            setMode('sovereign');
          }
        } else if (isMounted) {
          setUser(null);
          setMode('personal');
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setMode('personal');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrapAuth();

    // Subscribe to session expiration events
    const unsubscribe = onAuthExpired(() => {
      if (isMounted) {
        setUser(null);
        setMode('personal');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password: pass });
      setUser(response.user);
      setMode('sovereign');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, pass: string, displayName?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({ email, password: pass, displayName });
      setUser(response.user);
      setMode('sovereign');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      clearAccessToken();
    } finally {
      setUser(null);
      setMode('personal');
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        mode,
        isLoading,
        isAuthenticated: !!user && mode === 'sovereign',
        login,
        register,
        logout,
        setMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
