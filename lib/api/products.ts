/**
 * Client-side API functions for product management
 * These functions call the API routes instead of Server Actions
 */

import { 
  ProductWithRelations, 
  CreateProductData, 
  ProductData 
} from '@/lib/data/admin/actions/products/types';

/**
 * Fetches all products
 */
export async function fetchProducts(): Promise<ProductWithRelations[]> {
  const response = await fetch('/api/products', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch products');
  }

  return response.json();
}

/**
 * Creates a new product
 */
export async function createProductAPI(productData: CreateProductData): Promise<ProductWithRelations> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create product');
  }

  return response.json();
}

/**
 * Updates an existing product
 */
export async function updateProductAPI(
  productId: string,
  productData: Partial<ProductData>
): Promise<ProductWithRelations> {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update product');
  }

  return response.json();
}

/**
 * Toggles product active status
 */
export async function toggleProductStatusAPI(productId: string, isActive: boolean): Promise<void> {
  const response = await fetch(`/api/products/${productId}/toggle-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle product status');
  }
}

/**
 * Deletes a product permanently
 */
export async function deleteProductAPI(productId: string): Promise<void> {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete product');
  }
}

/**
 * Gets product category details (category_id and parent_id)
 */
export async function getProductCategoryDetailsAPI(
  productId: string
): Promise<{ category_id: string; parent_id: string | null }> {
  const response = await fetch(`/api/products/${productId}/category-details`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch product category details');
  }

  return response.json();
}

