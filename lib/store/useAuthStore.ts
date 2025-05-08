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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
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
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);