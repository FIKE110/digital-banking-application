import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';

interface AuthContextType {
  token: string | null;
  user: { username: string; email: string } | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    const t = res.data.token.accessToken;
    localStorage.setItem('token', t);
    localStorage.setItem('refreshToken', res.data.token.refreshToken);
    setToken(t);
    setUser({ username, email: '' });
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await apiRegister(username, email, password);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
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
