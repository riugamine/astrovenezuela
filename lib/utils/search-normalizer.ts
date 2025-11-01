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

