'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Custom hook to handle theme with hydration safety
 * Prevents hydration mismatches by ensuring consistent rendering
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    theme: mounted ? theme : 'system',
    resolvedTheme: mounted ? resolvedTheme : 'light',
    setTheme,
    mounted,
  };
}
