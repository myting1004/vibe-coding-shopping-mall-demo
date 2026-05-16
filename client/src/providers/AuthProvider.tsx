import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  fetchMe,
  type LoginInput,
} from '@/api/auth';
import { setAuthFailureHandler } from '@/lib/apiClient';
import type { SignupInput, User } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: SignupInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const me = await fetchMe();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshUser();
      if (mounted) setIsInitializing(false);
    })();
    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
      queryClient.clear();
    });
    return () => setAuthFailureHandler(null);
  }, [queryClient]);

  const login = useCallback(async (input: LoginInput) => {
    const next = await loginApi(input);
    setUser(next);
    return next;
  }, []);

  const register = useCallback(async (input: SignupInput) => {
    const next = await registerApi(input);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isInitializing, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
