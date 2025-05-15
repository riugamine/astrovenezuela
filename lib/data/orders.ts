import { supabaseAdmin } from "../supabase/admin";
import { OrderStatus, Database } from "../types/database.types";

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface CreateOrderParams {
  user_id?: string;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  whatsapp_number: string; // Add missing field from schema
  items: {
    product_id: string;
    variant_id: string;
    quantity: number;
    price: number;
  }[];
}

// Function to create an order and its items in a single transaction
export async function createOrder(params: CreateOrderParams): Promise<Order> {
  // Start a Supabase transaction
  const { data, error } = await supabaseAdmin.rpc('create_order_with_items', {
    p_user_id: params.user_id,
    p_status: 'created' as OrderStatus,
    p_total_amount: params.total_amount,
    p_shipping_address: params.shipping_address,
    p_payment_method: params.payment_method,
    p_whatsapp_number: params.whatsapp_number,
    p_items: params.items.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price
    }))
  });

  if (error) throw error;
  return data as Order;
}
