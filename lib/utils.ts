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
}

// Logo variants available in the brand-logo bucket
type LogoVariant = 'azul-bebe' | 'azul-marino' | 'blanco' | 'negro';

/**
 * Generates optimized URLs for brand logos
 * @param variant - The color variant of the logo
 * @returns The public URL for the logo
 */
export const getBrandLogo = (variant: LogoVariant = 'blanco') => {
  const variantMap = {
    'azul-bebe': 'azul-bebe',
    'azul-marino': 'azul-marino',
    'blanco': 'blanco',
    'negro': 'negro'
  };
  
  return `https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/object/public/brand-assets/brand-logo/${variantMap[variant]}.png`;

};