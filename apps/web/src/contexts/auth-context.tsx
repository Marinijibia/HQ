'use client';

import * as React from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  dbUser: any | null;
  organization: any | null;
  permissions: string[];
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  refetchUser: () => Promise<void>;
}

function isJwtExpired(tokenString: string): boolean {
  try {
    const payloadBase64 = tokenString.split('.')[1];
    if (!payloadBase64) return false;
    const decodedJson = JSON.parse(atob(payloadBase64));
    if (decodedJson && decodedJson.exp) {
      return Date.now() / 1000 >= decodedJson.exp - 60;
    }
  } catch { /* ignore */ }
  return false;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [dbUser, setDbUser] = React.useState<any | null>(null);
  const [organization, setOrganization] = React.useState<any | null>(null);
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const syncBackendSession = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken(false);
      setToken(idToken);

      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
        setOrganization(data.organization || null);
        setPermissions(data.permissions || []);
        
        const ownerName = data.user?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Executive';
        const orgName = data.organization?.name || 'HQ Organization';

        try {
          const rawDraft = localStorage.getItem('hq_onboarding_draft');
          const existingDraft = rawDraft && rawDraft.trim() ? JSON.parse(rawDraft) : {};
          localStorage.setItem(
            'hq_onboarding_draft',
            JSON.stringify({
              ...existingDraft,
              brandColor: data.organization?.brandColor || existingDraft.brandColor || '#06b6d4',
              ownerName,
              hqName: orgName,
              orgName,
            }),
          );
        } catch { /* ignore */ }
      } else {
        const meRes = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setDbUser(meData.user);
          setOrganization(meData.organization || meData.company || null);
          setPermissions(meData.permissions || []);

          const ownerName = meData.user?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Executive';
          const orgName = meData.organization?.name || meData.company?.name || 'HQ Organization';

          try {
            const rawDraft = localStorage.getItem('hq_onboarding_draft');
            const existingDraft = rawDraft && rawDraft.trim() ? JSON.parse(rawDraft) : {};
            localStorage.setItem(
              'hq_onboarding_draft',
              JSON.stringify({
                ...existingDraft,
                ownerName,
                hqName: orgName,
                orgName,
              }),
            );
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.warn('Backend authentication sync warning:', err);
    }
  };

  React.useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Unblock UI instantly on auth state resolution
      if (currentUser) {
        syncBackendSession(currentUser);
      } else {
        setToken(null);
        setDbUser(null);
        setOrganization(null);
        setPermissions([]);
      }
    });

    let originalFetch: typeof window.fetch | null = null;
    if (typeof window !== 'undefined') {
      originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const urlString = typeof input === 'string' ? input : (input as any)?.url || '';
        const isSelfApi = urlString.startsWith('/api') || urlString.startsWith('http://localhost') || urlString.startsWith('https://');

        if (isSelfApi && auth.currentUser) {
          try {
            let currentToken = token;
            if (!currentToken || isJwtExpired(currentToken)) {
              currentToken = await auth.currentUser.getIdToken(true);
              setToken(currentToken);
            }
            init = init || {};
            const headers = new Headers(init.headers || {});
            if (!headers.has('Authorization')) {
              headers.set('Authorization', `Bearer ${currentToken}`);
            }
            init.headers = headers;
          } catch (e) {
            console.warn('Failed to refresh Firebase token for fetch:', e);
          }
        }
        return originalFetch!(input, init);
      };
    }

    return () => {
      unsubscribe();
      if (originalFetch && typeof window !== 'undefined') {
        window.fetch = originalFetch;
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      await syncBackendSession(result.user);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setUser(res.user);
      await syncBackendSession(res.user);
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(res.user);
      await syncBackendSession(res.user);
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      setDbUser(null);
      setOrganization(null);
      setPermissions([]);
    } catch (error) {
      console.error('Sign-out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refetchUser = async () => {
    if (auth.currentUser) {
      await syncBackendSession(auth.currentUser);
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
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        token,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
