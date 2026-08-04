import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api, getToken, setToken } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<{ id: string; name: string; email: string; role: 'guest' | 'admin' }>('/auth/me');
      setUser({ id: me.id, name: me.name, email: me.email, role: me.role });
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ accessToken: string; user: { id: string; name: string; email: string; role: 'guest' | 'admin' } }>(
      '/auth/login',
      { email, password },
    );
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<{ accessToken: string; user: { id: string; name: string; email: string; role: 'guest' | 'admin' } }>(
      '/auth/register',
      { name, email, password },
    );
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('resortify_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('resortify_theme', theme);
  }, [theme]);

  return { theme, toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) };
}
