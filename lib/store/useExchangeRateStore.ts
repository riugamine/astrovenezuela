import { create } from "zustand";
import { ExchangeRate } from "@/lib/types/database.types";
import { getActiveExchangeRate } from "@/lib/data/exchange-rates";

interface ExchangeRateState {
  activeRate: ExchangeRate | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface ExchangeRateActions {
  fetchActiveRate: () => Promise<void>;
  refreshRate: () => Promise<void>;
  setActiveRate: (rate: ExchangeRate | null) => void;
  clearError: () => void;
}

type ExchangeRateStore = ExchangeRateState & ExchangeRateActions;

/**
 * Zustand store for managing exchange rate state
 * Provides global access to active exchange rates across the application
 */
export const useExchangeRateStore = create<ExchangeRateStore>((set, get) => ({
  // State
  activeRate: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  // Actions
  fetchActiveRate: async () => {
    set({ isLoading: true, error: null });

    try {
      const rate = await getActiveExchangeRate();
      set({
        activeRate: rate,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      set({
        activeRate: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch exchange rates",
        lastFetched: new Date(),
      });
    }
  },

  refreshRate: async () => {
    // Force refresh without any cache checks
    await get().fetchActiveRate();
  },

  setActiveRate: (rate) => {
    set({
      activeRate: rate,
      lastFetched: new Date(),
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Hook to get exchange rate with automatic fetching
 * @returns Exchange rate state and actions
 */
export const useExchangeRate = () => {
  const store = useExchangeRateStore();
  
  // Auto-fetch if no rate is loaded and not currently loading
  if (!store.activeRate && !store.isLoading && !store.error) {
    store.fetchActiveRate();
  }

  return store;
};

/**
 * Hook to get just the active exchange rate (read-only)
 * @returns Active exchange rate or null
 */
export const useActiveExchangeRate = (): ExchangeRate | null => {
  const { activeRate, fetchActiveRate, isLoading } = useExchangeRateStore();
  
  // Auto-fetch if no rate is loaded and not currently loading
  if (!activeRate && !isLoading) {
    fetchActiveRate();
  }

  return activeRate;
};
