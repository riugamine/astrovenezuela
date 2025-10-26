import { supabaseClient } from "@/lib/supabase/client";
import { ExchangeRate } from "@/lib/types/database.types";

/**
 * Fetches the currently active exchange rate
 * @returns Promise with active exchange rate or null if none exists
 */
export async function getActiveExchangeRate(): Promise<ExchangeRate | null> {
  try {
    const { data, error } = await supabaseClient
      .from("exchange_rates")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found - no active rate exists
        return null;
      }
      console.error("Error fetching active exchange rate:", error);
      return null; // Return null instead of throwing
    }

    return data;
  } catch (error) {
    console.error("Error fetching active exchange rate:", error);
    return null; // Return null instead of throwing
  }
}

/**
 * Fetches exchange rate history (last 10 entries)
 * @returns Promise with array of historical exchange rates
 */
export async function getExchangeRateHistory(): Promise<ExchangeRate[]> {
  try {
    const { data, error } = await supabaseClient
      .from("exchange_rates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching exchange rate history:", error);
      return []; // Return empty array instead of throwing
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching exchange rate history:", error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Creates a new exchange rate and deactivates all previous rates
 * This function uses the database function to ensure atomicity
 * @param bcvRate - Official BCV exchange rate
 * @param blackMarketRate - Black market exchange rate
 * @param updatedBy - ID of the admin user updating the rate
 * @returns Promise with the new exchange rate
 */
export async function createExchangeRate(
  bcvRate: number,
  blackMarketRate: number,
  updatedBy: string
): Promise<ExchangeRate> {
  try {
    const { data, error } = await supabaseClient.rpc("create_exchange_rate", {
      p_bcv_rate: bcvRate,
      p_black_market_rate: blackMarketRate,
      p_updated_by: updatedBy,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error creating exchange rate:", error);
    throw error;
  }
}


/**
 * Validates exchange rate values
 * @param bcvRate - BCV exchange rate
 * @param blackMarketRate - Black market exchange rate
 * @returns Validation result with success boolean and error message
 */
export function validateExchangeRates(
  bcvRate: number,
  blackMarketRate: number
): { isValid: boolean; error?: string } {
  if (!bcvRate || bcvRate <= 0) {
    return { isValid: false, error: "BCV rate must be greater than 0" };
  }

  if (!blackMarketRate || blackMarketRate <= 0) {
    return { isValid: false, error: "Black market rate must be greater than 0" };
  }

  if (bcvRate > blackMarketRate) {
    return {
      isValid: false,
      error: "Black market rate should typically be higher than BCV rate",
    };
  }

  return { isValid: true };
}
