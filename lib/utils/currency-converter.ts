/**
 * Currency conversion utilities for USD and VES (Venezuelan Bolívar)
 * Handles BCV (Banco Central de Venezuela) and black market exchange rates
 */

import { ExchangeRate } from "@/lib/types/database.types";

/**
 * Calculate USD price from reference price using exchange rates
 * Formula: (referencePrice * blackMarketRate) / bcvRate
 * Always rounds UP to 2 decimal places
 * 
 * @param referencePrice - The original reference price in USD
 * @param bcvRate - Official BCV exchange rate
 * @param blackMarketRate - Black market exchange rate
 * @returns USD price rounded up to 2 decimals
 */
export function calculateUSDPrice(
  referencePrice: number,
  bcvRate: number,
  blackMarketRate: number
): number {
  if (bcvRate <= 0 || blackMarketRate <= 0) {
    throw new Error("Exchange rates must be positive");
  }
  
  const calculatedPrice = (referencePrice * blackMarketRate) / bcvRate;
  // Round UP to 2 decimal places using Math.ceil with multiplication by 100
  return Math.ceil(calculatedPrice * 100) / 100;
}

/**
 * Calculate VES price from USD price using BCV rate
 * Formula: usdPrice * bcvRate
 * Always rounds UP to 2 decimal places
 * 
 * @param usdPrice - USD price to convert
 * @param bcvRate - Official BCV exchange rate
 * @returns VES price rounded up to 2 decimals
 */
export function calculateVESPrice(usdPrice: number, bcvRate: number): number {
  if (bcvRate <= 0) {
    throw new Error("BCV rate must be positive");
  }
  
  const calculatedPrice = usdPrice * bcvRate;
  // Round UP to 2 decimal places using Math.ceil with multiplication by 100
  return Math.ceil(calculatedPrice * 100) / 100;
}

/**
 * Calculate both USD and VES prices from reference price
 * 
 * @param referencePrice - The original reference price in USD
 * @param exchangeRate - Exchange rate object with BCV and black market rates
 * @returns Object with USD and VES prices
 */
export function calculateDualPrices(
  referencePrice: number,
  exchangeRate: ExchangeRate
): { usdPrice: number; vesPrice: number } {
  const usdPrice = calculateUSDPrice(
    referencePrice,
    exchangeRate.bcv_rate,
    exchangeRate.black_market_rate
  );
  
  const vesPrice = calculateVESPrice(usdPrice, exchangeRate.bcv_rate);
  
  return { usdPrice, vesPrice };
}

/**
 * Format dual currency price for display
 * 
 * @param usdPrice - USD price
 * @param vesPrice - VES price
 * @returns Formatted string: "14.58 $ | 3,000.00 VES"
 */
export function formatDualPrice(usdPrice: number, vesPrice: number): string {
  const formattedUSD = usdPrice.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const formattedVES = vesPrice.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${formattedUSD} $ | ${formattedVES} VES`;
}

/**
 * Format price with currency symbol
 * 
 * @param price - Price amount
 * @param currency - Currency symbol ($ for USD, VES for Venezuelan Bolívar)
 * @returns Formatted string with currency
 */
export function formatPrice(price: number, currency: "USD" | "VES"): string {
  const symbol = currency === "USD" ? "$" : "VES";
  const formattedPrice = price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${formattedPrice} ${symbol}`;
}

/**
 * Get calculation example for admin display
 * Shows how prices are calculated with current rates
 * 
 * @param exchangeRate - Current exchange rate
 * @param exampleReferencePrice - Example reference price (default: 10)
 * @returns Calculation example object
 */
export function getCalculationExample(
  exchangeRate: ExchangeRate,
  exampleReferencePrice: number = 10
): {
  referencePrice: number;
  bcvRate: number;
  blackMarketRate: number;
  usdPrice: number;
  vesPrice: number;
  formattedResult: string;
} {
  const { usdPrice, vesPrice } = calculateDualPrices(
    exampleReferencePrice,
    exchangeRate
  );
  
  return {
    referencePrice: exampleReferencePrice,
    bcvRate: exchangeRate.bcv_rate,
    blackMarketRate: exchangeRate.black_market_rate,
    usdPrice,
    vesPrice,
    formattedResult: formatDualPrice(usdPrice, vesPrice),
  };
}
