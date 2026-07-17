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
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [dbUser, setDbUser] = React.useState<any | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Get the ID token (without forcing refresh as the interceptor and interval will manage freshness)
          const idToken = await currentUser.getIdToken(false);
          setToken(idToken);
          const res = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (res.ok) {
            const dbUserData = await res.json();
            setDbUser(dbUserData);
            console.log('PostgreSQL User Profile Synced:', dbUserData);
            const settingsRes = await fetch('/api/settings/org', {
              headers: { 'Authorization': `Bearer ${idToken}` }
            });
            if (settingsRes.ok) {
              const orgData = await settingsRes.json();
              if (orgData && orgData.brandColor) {
                localStorage.setItem('hq_onboarding_draft', JSON.stringify({
                  brandColor: orgData.brandColor,
                  ownerName: orgData.name || 'Acme Corporation'
                }));
              }
            }
          }
        } catch (err) {
          console.warn('Error lazy-syncing user profile with postgres backend:', err);
        }
      } else {
        setToken(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    // Global fetch interceptor to handle expired tokens and automatic relogin
    let originalFetch: typeof window.fetch | null = null;
    if (typeof window !== 'undefined') {
      originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        let response = await originalFetch!(input, init);
        
        if (response.status === 401) {
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              // Token expired, force refresh from Firebase
              const newToken = await currentUser.getIdToken(true);
              setToken(newToken);
              
              // Prepare retried request headers
              const headers = new Headers((init && init.headers) || {});
              headers.set('Authorization', `Bearer ${newToken}`);
              
              // Retry fetching the original request with the fresh token
              response = await originalFetch!(input, {
                ...(init || {}),
                headers,
              });
              
              if (response.status === 401) {
                // If it's still 401, redirect to login
                await signOut(auth);
                window.location.href = '/login';
              }
            } catch (refreshError) {
              console.error('Fetch interceptor: failed refreshing token:', refreshError);
              await signOut(auth);
              window.location.href = '/login';
            }
          } else {
            // Not authenticated, redirect to login page if we are not already on it
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
              window.location.href = '/login';
            }
          }
        }
        return response;
      };
    }

    // Refresh token every 10 minutes to keep it active
    const tokenRefreshInterval = setInterval(async () => {
      if (auth.currentUser) {
        try {
          const freshToken = await auth.currentUser.getIdToken(false);
          setToken(freshToken);
        } catch (e) {
          console.warn('Interval refresh: token update failed:', e);
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

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Firebase Auth sign in failed:', error);
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
      console.error('Firebase Auth sign in with email failed:', error);
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
      console.error('Firebase Auth sign up with email failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase Auth sign out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        token,
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
