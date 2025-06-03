import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { persist } from 'zustand/middleware';
import { validateSession, clearSession, AuthSession } from '@/lib/services/oauth';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpiry: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  clearAuth: () => void;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => void;
  handleAuthStateChange: () => () => void;
  
  // OAuth methods
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: any; user?: User; session?: any }>;
  
  // Server-side validation
  validateServerSession: () => Promise<AuthSession>;
  refreshSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      sessionExpiry: null,

      setUser: (user) => set({ 
        user, 
        isLoading: false,
        isAuthenticated: !!user 
      }),

      setSession: (session) => set({ 
        session,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
      }),

      clearAuth: () => set({ 
        user: null, 
        session: null,
        isAuthenticated: false,
        sessionExpiry: null,
        isLoading: false
      }),

      signOut: async () => {
        try {
          // Clear server-side session
          await clearSession();
          
          // Clear client-side session
          const supabase = createClient();
          await supabase.auth.signOut();
          
          // Clear store state
          get().clearAuth();
        } catch (error) {
          console.error('Error during sign out:', error);
          // Force clear even if server call fails
          get().clearAuth();
        }
      },

      checkAuth: async () => {
        try {
          const supabase = createClient();
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error) {
            throw error;
          }

          // Validate with server-side session
          const serverValidation = await get().validateServerSession();
          
          if (serverValidation.isValid && user) {
            set({ 
              user: serverValidation.user || user,
              session: serverValidation.session,
              isLoading: false,
              isAuthenticated: true,
              sessionExpiry: serverValidation.expiresAt || null
            });
          } else {
            get().clearAuth();
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          get().clearAuth();
        }
      },

      initializeAuth: () => {
        const { isLoading, checkAuth, handleAuthStateChange } = get();
        
        if (isLoading) {
          checkAuth();
          handleAuthStateChange();
        }
      },

      handleAuthStateChange: () => {
        const supabase = createClient();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            switch (event) {
              case 'SIGNED_IN':
                if (session?.user) {
                  // Validate with server before trusting client session
                  const serverValidation = await get().validateServerSession();
                  
                  if (serverValidation.isValid) {
                    set({ 
                      user: serverValidation.user,
                      session: serverValidation.session,
                      isLoading: false,
                      isAuthenticated: true,
                      sessionExpiry: serverValidation.expiresAt || null
                    });
                  }
                }
                break;
                
              case 'SIGNED_OUT':
                get().clearAuth();
                break;
                
              case 'TOKEN_REFRESHED':
                if (session) {
                  get().setSession(session);
                }
                break;
                
              default:
                break;
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      },

      signInWithGoogle: async () => {
        try {
          // Import the server action dynamically to avoid issues
          const { initiateGoogleOAuth } = await import('@/lib/services/oauth');
          await initiateGoogleOAuth();
        } catch (error) {
          console.error('Error initiating Google OAuth:', error);
          throw error;
        }
      },

      signInWithPassword: async (email: string, password: string) => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return { error };
          }

          // Validate server-side session after client sign-in
          if (data.user && data.session) {
            const serverValidation = await get().validateServerSession();
            
            if (serverValidation.isValid) {
              set({ 
                user: serverValidation.user,
                session: serverValidation.session,
                isLoading: false,
                isAuthenticated: true,
                sessionExpiry: serverValidation.expiresAt || null
              });
            }
          }

          return { user: data.user, session: data.session };
        } catch (error) {
          console.error('Error signing in with password:', error);
          return { error };
        }
      },

      validateServerSession: async () => {
        try {
          return await validateSession();
        } catch (error) {
          console.error('Server session validation error:', error);
          return { user: null, session: null, isValid: false };
        }
      },

      refreshSession: async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error || !data.session) {
            return false;
          }
          
          // Validate the refreshed session with server
          const serverValidation = await get().validateServerSession();
          
          if (serverValidation.isValid) {
            set({
              user: serverValidation.user,
              session: serverValidation.session,
              sessionExpiry: serverValidation.expiresAt || null
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Error refreshing session:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        sessionExpiry: state.sessionExpiry
      }),
      // Add version for migration if needed
      version: 2,
    }
  )
);