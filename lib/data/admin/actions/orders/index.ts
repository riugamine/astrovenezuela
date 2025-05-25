'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { OrderWithProfile, OrderDetails } from './types';

export async function getOrders(): Promise<OrderWithProfile[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderById(orderId: string): Promise<OrderDetails> {
  const [orderResult, itemsResult] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .eq('id', orderId)
      .single(),
    supabaseAdmin
      .from('order_items')
      .select(`
        *,
        products (name, price),
        product_variants (id, stock, size)
      `)
      .eq('order_id', orderId)
  ]);

  if (orderResult.error) throw orderResult.error;
  if (itemsResult.error) throw itemsResult.error;

  return {
    order: orderResult.data,
    items: itemsResult.data || []
  };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderWithProfile['status']
): Promise<void> {
  // Get current order status and items
  const { data: currentOrder, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();

  if (orderError) throw orderError;

  // Validate status transitions
  if (!isValidStatusTransition(currentOrder.status, newStatus)) {
    throw new Error('Invalid status transition');
  }

  // If transitioning to delivered, update stock
  if (newStatus === 'delivered') {
    await updateStockForDeliveredOrder(orderId);
  }

  // Update order status
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) throw error;
}

function isValidStatusTransition(currentStatus: OrderWithProfile['status'], newStatus: OrderWithProfile['status']): boolean {
  // Define valid transitions
  const validTransitions: Record<OrderWithProfile['status'], OrderWithProfile['status'][]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['delivered', 'cancelled'],
    delivered: [], // No transitions allowed from delivered
    cancelled: [] // No transitions allowed from cancelled
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}
interface OrderItemWithStock {
  quantity: number;
  product_id: string;
  variant_id?: string;
  products: {
    stock: number;
  };
  product_variants?: {
    stock: number;
  } | null;
}
async function updateStockForDeliveredOrder(orderId: string): Promise<void> {
  // Get order items with product and variant information
  const { data: orderItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select(`
      quantity,
      product_id,
      variant_id,
      products!inner (stock),
      product_variants!left (stock)
    `)
    .eq('order_id', orderId)
    .overrideTypes<OrderItemWithStock[]>();

  if (itemsError) throw itemsError;

  // Update stock for each item
  for (const item of orderItems || []) {
    // Update product stock
    const { error: productError } = await supabaseAdmin
      .from('products')
      .update({ 
        stock: Math.max(0, item.products.stock - item.quantity)
      })
      .eq('id', item.product_id);

    if (productError) throw productError;

    // Update variant stock if exists
    if (item.variant_id && item.product_variants?.stock !== undefined) {
      const { error: variantError } = await supabaseAdmin
        .from('product_variants')
        .update({ 
          stock: Math.max(0, item.product_variants.stock - item.quantity)
        })
        .eq('id', item.variant_id);

      if (variantError) throw variantError;
    }
  }
}