import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../config/api';

interface User {
  id: number;
  username: string;
  info: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  username: string;
  password: string;
  cPassword: string;
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  city?: string;
  date_of_birth?: string;
  image_base64?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to get token from storage (checks both localStorage and sessionStorage)
const getStoredToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to remove token from both storages
const removeStoredToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());

  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get<{
        user_id: number;
        username: string;
        name: string;
        last_name: string;
        status: string;
      }>('/auth/me');
      setUser({
        id: data.user_id,
        username: data.username,
        info: `${data.name} ${data.last_name}`.trim(),
        status: data.status,
      });
    } catch (_err) {
      removeStoredToken();
      setToken(null);
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setUser(null);
    }
  }, [token, loadUser]);

  const login = async (username: string, password: string, remember = false) => {
    const data = await api.post<{ success: boolean; token?: string; user?: User; error?: string }>(
      '/auth/login',
      { username, password, remember }
    );
    if (data.success && data.token) {
      removeStoredToken();
      // Remember me checked: persist in localStorage (survives browser close, ~3 months).
      // Remember me unchecked: sessionStorage only (cleared when browser/tab is closed).
      if (remember) {
        localStorage.setItem('token', data.token);
      } else {
        sessionStorage.setItem('token', data.token);
      }
      setToken(data.token);
      if (data.user) setUser(data.user);
    } else {
      throw new Error(data.error || 'Login failed');
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  const register = async (formData: RegisterData | Record<string, string | undefined>) => {
    const data = await api.post<{ success: boolean; message?: string; errors?: Record<string, string> }>(
      '/auth/register',
      formData as RegisterData
    );
    if (!data.success) {
      throw data.errors || { _: data.message || 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        isAdmin: user?.status === 'Administrator',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
