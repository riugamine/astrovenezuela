import { supabaseServer } from "@/lib/supabase/server";
import { ExchangeRate } from "@/lib/types/database.types";

/**
 * Server-side function to get active exchange rate
 * Used for server components and API routes
 * @returns Promise with active exchange rate or null
 */
export async function getActiveExchangeRateServer(): Promise<ExchangeRate | null> {
  try {
    // Check if required environment variables are present
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Missing Supabase environment variables");
      return null;
    }

    const supabase = await supabaseServer();
    
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found - no active rate exists
        console.warn("No active exchange rate found");
        return null;
      }
      console.error("Supabase error fetching exchange rate:", error);
      return null; // Return null instead of throwing
    }

    return data;
  } catch (error) {
    console.error("Error fetching active exchange rate (server):", error);
    // Return null instead of throwing to prevent 500 errors
    return null;
  }
}
