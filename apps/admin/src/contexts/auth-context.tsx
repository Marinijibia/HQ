'use client';

import * as React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbUser {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  role: string;
  companyId?: string;
}

interface AuthContextType {
  user: DbUser | null;
  dbUser: DbUser | null;
  loading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'hq_admin_token';

function isTokenExpired(token: string): boolean {
  try {
    const payloadB64 = token.split('.')[0];
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload?.exp) return true;
    return Date.now() / 1000 >= payload.exp - 60;
  } catch {
    return true;
  }
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || isTokenExpired(token)) {
    if (token) localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<DbUser | null>(null);
  const [dbUser, setDbUser] = React.useState<DbUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchMe = React.useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const loaded = data.user || data.profile || (data.id ? data : null);
        setUser(loaded);
        setDbUser(loaded);
      } else if (res.status === 401) {
        // Token rejected — clear session
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setDbUser(null);
      }
    } catch (err) {
      console.warn('Admin fetchMe notice:', err);
    }
  }, []);

  React.useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
      fetchMe(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Fetch interceptor: auto-attach Bearer token + handle 401 redirect
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlString = typeof input === 'string' ? input : (input as Request)?.url || String(input);
        const isInternalApi =
          urlString.startsWith('/api') ||
          urlString.includes('localhost') ||
          urlString.includes('hq.netify.ng');

        if (isInternalApi) {
          const currentToken = localStorage.getItem(TOKEN_KEY);
          if (currentToken && !isTokenExpired(currentToken)) {
            init = init || {};
            const headers = new Headers(init.headers || {});
            if (!headers.has('Authorization')) {
              headers.set('Authorization', `Bearer ${currentToken}`);
            }
            init = { ...init, headers };
          }
        }

        const response = await originalFetch(input, init);

        // On 401: clear session and redirect to login
        if (
          response.status === 401 &&
          isInternalApi &&
          !window.location.pathname.startsWith('/login')
        ) {
          localStorage.removeItem(TOKEN_KEY);
          window.location.href = '/login';
        }

        return response;
      };
    }
  }, [fetchMe]);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setDbUser(data.user);
      await fetchMe(data.token);
    } catch (error) {
      console.error('Admin sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // Google SSO removed — Firebase dependency removed
    throw new Error('Google sign-in is not available. Please use email and password.');
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('hq_onboarding_draft');
    localStorage.removeItem('hq_admin_user_rank');
    setToken(null);
    setUser(null);
    setDbUser(null);
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, token, signInWithGoogle, signInWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
