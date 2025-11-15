'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { CreateSaleData, OrderWithProfile, OrderDetails } from './types';
import { getOrders, getOrderById } from '../orders';

/**
 * Creates a new admin sale using the guest order function
 * This allows admins to create orders on behalf of customers
 */
export async function createAdminSale(saleData: CreateSaleData) {
  const {
    customer_first_name,
    customer_last_name,
    customer_phone,
    customer_email,
    customer_dni,
    shipping_address,
    shipping_method,
    agency_address,
    payment_method,
    whatsapp_number,
    items,
    status = 'pending',
    order_notes,
  } = saleData;

  // Calculate total amount from items
  const total_amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Prepare items for the database function
  const itemsJson = items.map(item => ({
    product_id: item.product_id,
    variant_id: item.variant_id || null,
    quantity: item.quantity,
    price: item.price,
  }));

  // Call the database function to create guest order with items
  const { data, error } = await supabaseAdmin.rpc('create_guest_order_with_items', {
    p_status: status,
    p_total_amount: total_amount,
    p_shipping_address: shipping_address,
    p_payment_method: payment_method,
    p_whatsapp_number: whatsapp_number,
    p_customer_email: customer_email || null,
    p_customer_first_name: customer_first_name,
    p_customer_last_name: customer_last_name,
    p_customer_dni: customer_dni || null,
    p_customer_phone: customer_phone,
    p_shipping_method: shipping_method,
    p_order_notes: order_notes || null,
    p_agency_address: agency_address || null,
    p_items: itemsJson,
  });

  if (error) {
    console.error('Error creating admin sale:', error);
    throw new Error(error.message || 'Failed to create sale');
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to create sale - no data returned');
  }

  // Fetch the complete order details
  const orderDetails = await getOrderById(data[0].id);
  
  return orderDetails;
}

/**
 * Fetches all sales/orders for admin view
 * Reuses the existing getOrders function
 */
export async function getAllSales(): Promise<OrderWithProfile[]> {
  return getOrders();
}

/**
 * Gets a specific sale by ID
 * Reuses the existing getOrderById function
 */
export async function getSaleById(saleId: string): Promise<OrderDetails> {
  return getOrderById(saleId);
}

