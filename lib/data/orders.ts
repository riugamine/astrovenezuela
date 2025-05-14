import { supabaseAdmin } from "../supabase/admin";
import { Order, OrderItem, OrderStatus, PaymentMethod } from "../types/database.types";

interface CreateOrderParams {
  user_id?: string;
  total_amount: number;
  shipping_address: string;
  payment_method: PaymentMethod;
  items: {
    product_id: string;
    variant_id: string;
    quantity: number;
    price: number;
  }[];
}

export async function createOrder(params: CreateOrderParams) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert([
      {
        user_id: params.user_id,
        status: 'created' as OrderStatus,
        total_amount: params.total_amount,
        shipping_address: params.shipping_address,
        payment_method: params.payment_method,
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = params.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
}
