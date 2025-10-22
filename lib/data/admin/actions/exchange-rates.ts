"use server";

import { revalidatePath } from "next/cache";
import { createExchangeRate, validateExchangeRates } from "@/lib/data/exchange-rates";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Server action to create or update exchange rates
 * @param formData - Form data containing BCV and black market rates
 * @returns Promise with success status and message
 */
export async function createExchangeRateAction(formData: FormData) {
  try {
    const bcvRateStr = formData.get("bcvRate") as string;
    const blackMarketRateStr = formData.get("blackMarketRate") as string;

    if (!bcvRateStr || !blackMarketRateStr) {
      return {
        success: false,
        error: "Both BCV and Black Market rates are required",
      };
    }

    const bcvRate = parseFloat(bcvRateStr);
    const blackMarketRate = parseFloat(blackMarketRateStr);

    // Validate rates
    const validation = validateExchangeRates(bcvRate, blackMarketRate);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Get current user (must be admin)
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return {
        success: false,
        error: "Admin privileges required",
      };
    }

    // Create new exchange rate
    await createExchangeRate(bcvRate, blackMarketRate, user.id);

    // Revalidate all pages to show updated rates globally
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/products", "page");
    revalidatePath("/cart", "page");

    return {
      success: true,
      message: "Exchange rates updated successfully",
    };
  } catch (error) {
    console.error("Error in createExchangeRateAction:", error);
    return {
      success: false,
      error: "Failed to update exchange rates. Please try again.",
    };
  }
}

/**
 * Server action to get exchange rate history for admin display
 * @returns Promise with historical exchange rates
 */
export async function getExchangeRateHistoryAction() {
  try {
    const supabase = await supabaseServer();
    
    const { data, error } = await supabase
      .from("exchange_rates")
      .select(`
        *,
        profiles!exchange_rates_updated_by_fkey (
          auth.users!inner (
            email
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error in getExchangeRateHistoryAction:", error);
    return {
      success: false,
      error: "Failed to fetch exchange rate history",
    };
  }
}
