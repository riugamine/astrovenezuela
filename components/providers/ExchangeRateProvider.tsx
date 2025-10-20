"use client";

import { useEffect } from "react";
import { useExchangeRateStore } from "@/lib/store/useExchangeRateStore";

/**
 * Provider component to initialize exchange rates on app load
 * This ensures exchange rates are available globally across the application
 */
export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
  const { fetchActiveRate } = useExchangeRateStore();

  useEffect(() => {
    // Initialize exchange rates when the app loads
    fetchActiveRate();
  }, [fetchActiveRate]);

  return <>{children}</>;
}
