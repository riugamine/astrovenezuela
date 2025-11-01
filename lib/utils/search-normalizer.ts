/**
 * Normalizes search text by removing accents and converting to lowercase
 * This enables accent-insensitive search functionality
 * @param text - The text to normalize
 * @returns Normalized text without accents and in lowercase
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Remove accents using regex replacements
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c');
}

/**
 * Creates search variations for better matching
 * Handles singular/plural forms and common variations
 * @param text - The search text
 * @returns Array of search variations
 */
export function getSearchVariations(text: string): string[] {
  if (!text) return [];
  
  const normalized = normalizeSearchText(text);
  const variations: string[] = [normalized];
  
  // Add singular form (remove trailing 's' or 'es')
  if (normalized.endsWith('es')) {
    variations.push(normalized.slice(0, -2));
  } else if (normalized.endsWith('s')) {
    variations.push(normalized.slice(0, -1));
  }
  
  // Add plural forms if word doesn't end in 's'
  if (!normalized.endsWith('s')) {
    variations.push(normalized + 's');
    variations.push(normalized + 'es');
  }
  
  // Remove duplicates
  return [...new Set(variations)];
}

