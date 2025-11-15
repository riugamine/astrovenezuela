/**
 * Types for admin sales management
 */

import { OrderWithProfile, OrderDetails } from '../orders/types';

/**
 * Individual sale item with product and variant information
 */
export interface SaleItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
}

/**
 * Data structure for creating a new admin sale
 */
export interface CreateSaleData {
  // Customer information
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_dni?: string;
  
  // Shipping information
  shipping_address: string;
  shipping_method: string;
  agency_address?: string;
  
  // Payment information
  payment_method: string;
  whatsapp_number: string;
  
  // Order items
  items: SaleItem[];
  
  // Order status (defaults to 'pending')
  status?: 'pending' | 'confirmed' | 'cancelled' | 'delivered';
  
  // Optional notes
  order_notes?: string;
}

/**
 * Re-export order types for consistency
 */
export type { OrderWithProfile, OrderDetails };

