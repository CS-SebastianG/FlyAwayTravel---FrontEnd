import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../api';
import { CurrentUser } from '../types';

interface AuthContextValue {
  token: string | null;
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }
    api
      .get<CurrentUser>('/users/current')
      .then((res) => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));
  }, [token]);

  function login(newToken: string) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, currentUser, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
}
