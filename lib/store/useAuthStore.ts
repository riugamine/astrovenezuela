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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ 
        user, 
        isLoading: false,
        isAuthenticated: !!user 
      }),

      setSession: (session) => set({ session }),

      clearAuth: () => set({ 
        user: null, 
        session: null,
        isAuthenticated: false,
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
          set({ isLoading: true });
          
          const supabase = createClient();
          const { data: { user }, error } = await supabase.auth.getUser();
          const { data: { session } } = await supabase.auth.getSession();

          if (error) {
            console.error('Auth check error:', error);
            get().clearAuth();
            return;
          }

          if (user && session) {
            console.log('✅ Auth check successful:', { user: user.email });
            set({ 
              user,
              session,
              isLoading: false,
              isAuthenticated: true
            });
          } else {
            console.log('ℹ️ No authenticated user found');
            get().clearAuth();
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          get().clearAuth();
        }
      },

      initializeAuth: () => {
        const { checkAuth, handleAuthStateChange } = get();
        
        console.log('🔐 Initializing authentication...');
        
        // Check if we have an OAuth success parameter
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const hasAuthSuccess = urlParams.get('auth_success') === 'true';
          
          if (hasAuthSuccess) {
            console.log('🎉 OAuth success detected, clearing URL and checking auth...');
            // Clear the URL parameter
            const url = new URL(window.location.href);
            url.searchParams.delete('auth_success');
            window.history.replaceState({}, '', url.toString());
            
            // Give Supabase a moment to establish the session
            setTimeout(() => checkAuth(), 500);
          } else {
            checkAuth();
          }
        } else {
          checkAuth();
        }
        
        // Set up auth state change listener
        handleAuthStateChange();
      },

      handleAuthStateChange: () => {
        const supabase = createClient();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔔 Auth state changed:', event, session?.user?.email);
            
            switch (event) {
              case 'SIGNED_IN':
                if (session?.user) {
                  console.log('✅ User signed in');
                  set({ 
                    user: session.user,
                    session: session,
                    isLoading: false,
                    isAuthenticated: true
                  });
                }
                break;
                
              case 'SIGNED_OUT':
                console.log('👋 User signed out');
                get().clearAuth();
                break;
                
              case 'TOKEN_REFRESHED':
                if (session) {
                  console.log('🔄 Token refreshed');
                  set({ session });
                }
                break;
                
              default:
                console.log('🔔 Other auth event:', event);
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
          console.log('🔄 Initiating Google OAuth...');
          
          // Import the server action dynamically
          const { initiateGoogleOAuth } = await import('@/lib/services/oauth');
          const result = await initiateGoogleOAuth();
          
          if (result.success && result.url) {
            console.log('🔄 Redirecting to Google...');
            // Redirect to the OAuth URL
            window.location.href = result.url;
          } else {
            throw new Error(result.error || 'Failed to initiate OAuth');
          }
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

          return { user: data.user, session: data.session };
        } catch (error) {
          console.error('Error signing in with password:', error);
          return { error };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
      }),
      version: 3, // Increased version to clear old data
    }
  )
);