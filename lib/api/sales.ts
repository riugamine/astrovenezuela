/**
 * Client-side API functions for sales management
 * These functions call the API routes instead of Server Actions
 */

import { 
  CreateSaleData,
  OrderWithProfile,
  OrderDetails
} from '@/lib/data/admin/actions/sales/types';

/**
 * Fetches all sales/orders
 */
export async function fetchAllSalesAPI(): Promise<OrderWithProfile[]> {
  const response = await fetch('/api/sales', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sales');
  }

  return response.json();
}

/**
 * Creates a new admin sale
 */
export async function createSaleAPI(saleData: CreateSaleData): Promise<OrderDetails> {
  const response = await fetch('/api/sales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(saleData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create sale');
  }

  return response.json();
}

/**
 * Fetches a specific sale by ID
 */
export async function getSaleByIdAPI(saleId: string): Promise<OrderDetails> {
  const response = await fetch(`/api/orders/${saleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sale');
  }

  return response.json();
}

