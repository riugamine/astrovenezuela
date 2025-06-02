import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => void;
  handleAuthStateChange: () => () => void; // Retorna una función para limpiar el listener
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: any; user?: User; session?: any }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      clearAuth: () => set({ user: null }),
      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null });
      },
      checkAuth: async () => {
        try {
          const supabase = createClient();
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error) {
            throw error;
          }

          set({ 
            user: user || null,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error checking auth:', error);
          set({ 
            user: null,
            isLoading: false 
          });
        }
      },
      // Inicializa la autenticación y configura los listeners
      initializeAuth: () => {
        // Solo ejecutamos si estamos cargando y no hay usuario
        if (get().isLoading) {
          get().checkAuth();
          get().handleAuthStateChange();
        }
      },
      // Configura el listener para cambios en la autenticación
      handleAuthStateChange: () => {
        const supabase = createClient();
        
        // Suscribirse a cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            if (session?.user) {
              set({ user: session.user, isLoading: false });
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, isLoading: false });
            }
          }
        );
        
        // Retorna una función para limpiar el listener
        return () => {
          subscription.unsubscribe();
        };
      },
      // Iniciar sesión con Google
      signInWithGoogle: async () => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            },
            skipBrowserRedirect: false
          }
        });
        
        if (error) {
          console.error('Error de Google OAuth:', error);
          throw error;
        }
      },
      // Iniciar sesión con email y contraseña
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

          if (data.user) {
            set({ user: data.user, isLoading: false });
          }

          return { user: data.user, session: data.session };
        } catch (error) {
          console.error('Error de inicio de sesión:', error);
          return { error };
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);