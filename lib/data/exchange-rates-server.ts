import { supabaseServer } from "@/lib/supabase/server";
import { ExchangeRate } from "@/lib/types/database.types";

/**
 * Server-side function to get active exchange rate
 * Used for server components and API routes
 * @returns Promise with active exchange rate or null
 */
export async function getActiveExchangeRateServer(): Promise<ExchangeRate | null> {
  try {
    const supabase = await supabaseServer();
    
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found - no active rate exists
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching active exchange rate (server):", error);
    throw error;
  }
}
