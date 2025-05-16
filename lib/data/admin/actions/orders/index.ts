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
        products (name, price)
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
  status: OrderWithProfile['status']
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}