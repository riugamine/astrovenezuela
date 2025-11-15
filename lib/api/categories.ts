/**
 * Client-side API functions for category management
 * These functions call the API routes instead of Server Actions
 */

import { Category, CategoryData, CategoryWithSubcategories } from '@/lib/data/admin/actions/categories/types';

/**
 * Fetches all categories
 */
export async function fetchCategories(): Promise<CategoryWithSubcategories[]> {
  const response = await fetch('/api/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch categories');
  }

  return response.json();
}

/**
 * Creates a new category
 */
export async function createCategoryAPI(categoryData: CategoryData): Promise<Category> {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }

  return response.json();
}

/**
 * Updates an existing category
 */
export async function updateCategoryAPI(
  categoryId: string,
  categoryData: Partial<CategoryData>
): Promise<Category> {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category');
  }

  return response.json();
}

/**
 * Toggles category active status
 */
export async function toggleCategoryStatusAPI(categoryId: string): Promise<void> {
  const response = await fetch(`/api/categories/${categoryId}/toggle-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle category status');
  }
}

/**
 * Deletes a category permanently
 */
export async function deleteCategoryAPI(categoryId: string): Promise<void> {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }
}

/**
 * Deletes a category banner
 */
export async function deleteCategoryBannerAPI(
  categoryId: string,
  bannerUrl: string
): Promise<void> {
  const response = await fetch(`/api/categories/${categoryId}/banner`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bannerUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category banner');
  }
}

