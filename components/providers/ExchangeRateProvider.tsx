"use client";

import { useEffect, useRef } from "react";
import { useExchangeRateStore } from "@/lib/store/useExchangeRateStore";
import { toast } from "sonner";

/**
 * Provider component to initialize exchange rates on app load
 * This ensures exchange rates are available globally across the application
 * Includes polling every 30 seconds to detect rate changes
 */
export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
  const { fetchActiveRate, activeRate } = useExchangeRateStore();
  const previousRateRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize exchange rates when the app loads
    fetchActiveRate();
  }, [fetchActiveRate]);

  useEffect(() => {
    // Poll for exchange rate changes every 30 seconds
    const interval = setInterval(async () => {
      try {
        await fetchActiveRate();
      } catch (error) {
        console.error("Error polling exchange rates:", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchActiveRate]);

  useEffect(() => {
    // Show notification when rates change
    if (activeRate) {
      const currentRateKey = `${activeRate.bcv_rate}-${activeRate.black_market_rate}`;
      
      if (previousRateRef.current && previousRateRef.current !== currentRateKey) {
        toast.success("Tasas de cambio actualizadas", {
          description: `BCV: ${activeRate.bcv_rate.toLocaleString()} | Dólar Negro: ${activeRate.black_market_rate.toLocaleString()}`,
          duration: 5000,
        });
      }
      
      previousRateRef.current = currentRateKey;
    }
  }, [activeRate]);

  return <>{children}</>;
}
