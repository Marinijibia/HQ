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
          const existingDraft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
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
            const existingDraft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
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
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncBackendSession(currentUser);
      } else {
        setToken(null);
        setDbUser(null);
        setOrganization(null);
        setPermissions([]);
      }
      setLoading(false);
    });

    let originalFetch: typeof window.fetch | null = null;
    if (typeof window !== 'undefined') {
      originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        let response = await originalFetch!(input, init);

        const urlString = typeof input === 'string' ? input : (input as any)?.url || '';
        if (urlString.includes('/api/auth/') || urlString.includes('/organizations/onboard')) {
          return response;
        }

        if (response.status === 401) {
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              const newToken = await currentUser.getIdToken(true);
              setToken(newToken);

              const headers = new Headers((init && init.headers) || {});
              headers.set('Authorization', `Bearer ${newToken}`);

              response = await originalFetch!(input, {
                ...(init || {}),
                headers,
              });

              if (response.status === 401) {
                await signOut(auth);
                if (
                  typeof window !== 'undefined' &&
                  !window.location.pathname.startsWith('/login') &&
                  !window.location.pathname.startsWith('/onboarding')
                ) {
                  window.location.href = '/login';
                }
              }
            } catch (refreshError) {
              console.error('Token refresh interceptor error:', refreshError);
              await signOut(auth);
              if (
                typeof window !== 'undefined' &&
                !window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/onboarding')
              ) {
                window.location.href = '/login';
              }
            }
          } else {
            if (
              typeof window !== 'undefined' &&
              !window.location.pathname.startsWith('/login') &&
              !window.location.pathname.startsWith('/onboarding') &&
              !window.location.pathname.startsWith('/forgot-password') &&
              !window.location.pathname.startsWith('/reset-password')
            ) {
              window.location.href = '/login';
            }
          }
        }
        return response;
      };
    }

    const tokenRefreshInterval = setInterval(async () => {
      if (auth.currentUser) {
        try {
          const freshToken = await auth.currentUser.getIdToken(false);
          setToken(freshToken);
        } catch (e) {
          console.warn('Interval refresh: token update warning:', e);
        }
      }
    }, 10 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(tokenRefreshInterval);
      if (typeof window !== 'undefined' && originalFetch) {
        window.fetch = originalFetch;
      }
    };
  }, []);

  const refetchUser = async () => {
    if (auth.currentUser) {
      await syncBackendSession(auth.currentUser);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Firebase Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Firebase Email sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Firebase Email sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
