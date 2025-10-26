"use client";

import { useEffect, useRef } from "react";
import { useExchangeRateStore } from "@/lib/store/useExchangeRateStore";
import { toast } from "sonner";
import { ExchangeRate } from "@/lib/types/database.types";

interface ExchangeRateProviderProps {
  children: React.ReactNode;
  initialRate?: ExchangeRate | null;
}

/**
 * Provider component to initialize exchange rates on app load
 * This ensures exchange rates are available globally across the application
 * Includes polling every 30 seconds to detect rate changes
 * Can accept an initial rate from server-side rendering to prevent hydration issues
 */
export function ExchangeRateProvider({ children, initialRate }: ExchangeRateProviderProps) {
  const { fetchActiveRate, activeRate, setActiveRate } = useExchangeRateStore();
  const previousRateRef = useRef<string | null>(null);

  useEffect(() => {
    // If we have an initial rate from server, set it first
    if (initialRate) {
      setActiveRate(initialRate);
    }
    
    // Then fetch the latest rate (this will update if there are changes)
    fetchActiveRate();
  }, [fetchActiveRate, setActiveRate, initialRate]);

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
