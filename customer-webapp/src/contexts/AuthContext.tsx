import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '../api/auth';
import { clearStoredAuth } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  const fetchMe = useCallback(async (accessToken: string) => {
    try {
      const res = await getMe(accessToken);
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) fetchMe(storedToken);
  }, [fetchMe, token]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    const accessToken = res.data.token.accessToken;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', res.data.token.refreshToken);
    setToken(accessToken);
    const userData = await fetchMe(accessToken);
    return userData!;
  }, [fetchMe]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await apiRegister(username, email, password);
  }, []);

  const logout = useCallback(() => {
    const accessToken = localStorage.getItem('token');
    if (accessToken) apiLogout(accessToken).catch(() => {});
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
