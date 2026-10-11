import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import api from '../api/client';
import { fetchMe, loginRequest, registerRequest } from '../api/auth';
import type { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'nexcart_token';

/**
 * Holds the JWT in memory (and localStorage for refresh persistence).
 * On app boot, validates any stored token against GET /users/me.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (!saved) {
        setInitializing(false);
        return;
      }
      try {
        const me = await fetchMe();
        setUser(me);
        setToken(saved);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    }
    bootstrap();
  }, []);

  function persist(auth: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, auth.token);
    setToken(auth.token);
    // Full profile is lazy-loaded via /me on next bootstrap; keep the
    // essentials for immediate UI rendering.
    setUser({ username: auth.username, email: auth.email });
  }

  async function login(usernameOrEmail: string, password: string) {
    const auth = await loginRequest(usernameOrEmail, password);
    persist(auth);
  }

  async function register(username: string, email: string, password: string) {
    const auth = await registerRequest(username, email, password);
    persist(auth);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    // Ensure axios drops the header on subsequent anonymous requests
    delete api.defaults.headers.common.Authorization;
  }

  return (
    <AuthContext.Provider
      value={{ user, token, initializing, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
