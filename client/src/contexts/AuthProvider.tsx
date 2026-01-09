'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  refreshAuth: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  refreshAuth: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const checkAuth = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const apiPath = apiUrl.includes('/api') ? '' : '/api';

      const response = await fetch(`${apiUrl}${apiPath}/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (isMountedRef.current) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
        }
        return;
      }

      const data = await response.json();

      if (data.ok && data.data?.user) {
        if (isMountedRef.current) {
          setIsAuthenticated(true);
          setIsAdmin(data.data.user.role === 'admin');
          setIsLoading(false);
        }
      } else {
        if (isMountedRef.current) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
      }
    }
  }, []);

  const refreshAuth = useCallback(() => {
    setIsLoading(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    isMountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();

    // Listen for auth changes
    const onAuthChanged = () => {
      refreshAuth();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'auth-state') {
        refreshAuth();
      }
    };

    window.addEventListener('auth-changed', onAuthChanged);
    window.addEventListener('storage', onStorage);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, [checkAuth, refreshAuth]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isLoading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
