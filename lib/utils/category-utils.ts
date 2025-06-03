import { Category } from '@/lib/types/database.types';

/**
 * Converts category name or slug to URL-friendly parameter
 */
export function categoryToURLParam(category: Category): string {
  return category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Finds category by name, slug, or ID
 */
export function findCategoryByIdentifier(
  categories: Category[], 
  identifier: string
): Category | undefined {
  const normalizedIdentifier = identifier.toLowerCase();
  
  return categories.find(cat => 
    cat.id === identifier ||
    cat.slug === normalizedIdentifier ||
    cat.name.toLowerCase() === normalizedIdentifier ||
    cat.name.toLowerCase().replace(/\s+/g, '-') === normalizedIdentifier
  );
}

/**
 * Converts category identifiers to category IDs
 */
export function categoriesToIds(
  categories: Category[], 
  identifiers: string[]
): string[] {
  const categoryIds: string[] = [];
  
  identifiers.forEach(identifier => {
    const category = findCategoryByIdentifier(categories, identifier);
    if (category) {
      categoryIds.push(category.id);
    }
  });
  
  return categoryIds;
}

/**
 * Gets category names from IDs for display purposes
 */
export function getSelectedCategoryNames(
  categories: Category[], 
  categoryIds: string[]
): string[] {
  return categoryIds
    .map(id => categories.find(cat => cat.id === id)?.name)
    .filter(Boolean) as string[];
} 