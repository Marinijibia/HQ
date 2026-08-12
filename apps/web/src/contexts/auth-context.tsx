'use client';

import * as React from 'react';
import { toast } from '../components/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbUser {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  photoUrl?: string;
  role: string;
  companyId: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: DbUser | null;
  dbUser: DbUser | null;
  organization: any | null;
  permissions: string[];
  loading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'hq_auth_token';

function decodeTokenPayload(token: string): any | null {
  try {
    const payloadB64 = token.split('.')[0];
    return JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload?.exp) return true;
    return Date.now() / 1000 >= payload.exp - 60; // 60s buffer
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
  const [organization, setOrganization] = React.useState<any | null>(null);
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  // ── Load user profile from API ─────────────────────────────────────────────
  const fetchMe = React.useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const loadedUser = data.user || data.profile || (data.id ? data : null);
        setUser(loadedUser);
        setDbUser(loadedUser);
        setOrganization(data.organization || data.company || null);
        setPermissions(data.permissions || []);

        // Persist org context to onboarding draft for continuity
        try {
          const rawDraft = localStorage.getItem('hq_onboarding_draft');
          const existing = rawDraft ? JSON.parse(rawDraft) : {};
          localStorage.setItem(
            'hq_onboarding_draft',
            JSON.stringify({
              ...existing,
              orgName: data.organization?.name || existing.orgName || '',
              orgSlug: data.organization?.slug || existing.orgSlug || '',
            }),
          );
        } catch {}
      } else {
        // Token accepted but user not found — clear session
        if (res.status === 401) clearSession();
      }
    } catch (err) {
      console.warn('fetchMe notice:', err);
    }
  }, []);

  // ── Session helpers ────────────────────────────────────────────────────────
  const setSession = React.useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const clearSession = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('hq_session_token');
    localStorage.removeItem('hq_onboarding_draft');
    setToken(null);
    setUser(null);
    setDbUser(null);
    setOrganization(null);
    setPermissions([]);
  }, []);

  // ── Mount: restore session from localStorage ───────────────────────────────
  React.useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
      fetchMe(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Fetch interceptor: auto-attach Bearer token to all /api requests
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlString = typeof input === 'string' ? input : (input as Request)?.url || String(input);
        const needsAuth =
          urlString.startsWith('/api') ||
          urlString.includes('localhost') ||
          urlString.includes('hq.netify.ng') ||
          urlString.includes('api.hq.netify.ng');

        if (needsAuth) {
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
        return originalFetch(input, init);
      };
    }
  }, [fetchMe]);

  // ── Auth Methods ───────────────────────────────────────────────────────────

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
      setSession(data.token);
      setUser(data.user);
      setDbUser(data.user);
      setOrganization(data.organization || null);
      setPermissions(data.permissions || []);
      await fetchMe(data.token);
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      toast.error(error?.message || 'Email authentication failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSession(data.token);
      setUser(data.user);
      setDbUser(data.user);
      setOrganization(data.organization || null);
      setPermissions(data.permissions || []);
      await fetchMe(data.token);
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      toast.error(error?.message || 'Registration failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // Google SSO removed — was dependent on Firebase SDK
    // Will be re-added via direct Google OAuth2 in a future release
    toast.info('Google sign-in is temporarily unavailable. Please use your email and password.');
  };

  const logout = async () => {
    clearSession();
  };

  const refetchUser = async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY) || token;
    if (currentToken) {
      await fetchMe(currentToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        organization,
        permissions,
        loading,
        token,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
