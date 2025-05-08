import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  clearAuth: () => void;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      clearAuth: () => set({ user: null, session: null }),
      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },
      checkAuth: async () => {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          set({ 
            user: session?.user || null, 
            session, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Error checking auth:', error);
          set({ 
            user: null, 
            session: null, 
            isLoading: false 
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, session: state.session })
    }
  )
);