'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

/**
 * AuthProvider Component
 * 
 * This component initializes the authentication system when the app starts.
 * It should be placed at the root level of the app to ensure proper auth state management.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth, handleAuthStateChange } = useAuthStore();

  useEffect(() => {
    // Initialize authentication on app startup
    console.log('🔐 Initializing authentication system...');
    
    // Initialize auth and set up auth state listeners
    initializeAuth();
    
    // Set up auth state change listener
    const unsubscribe = handleAuthStateChange();
    
    // Cleanup subscription on unmount
    return () => {
      console.log('🔐 Cleaning up authentication listeners...');
      unsubscribe();
    };
  }, [initializeAuth, handleAuthStateChange]);

  return <>{children}</>;
} 