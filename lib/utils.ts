import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Formatea un número como moneda en USD
 * @param amount - Cantidad a formatear
 * @returns String formateado como moneda (ejemplo: $99.99)
 */
export const formatCurrency = (amount: number): string => {
 return new Intl.NumberFormat('en-US', {
   style: 'currency',
   currency: 'USD',
   minimumFractionDigits: 2,
   maximumFractionDigits: 2
 }).format(amount);
};