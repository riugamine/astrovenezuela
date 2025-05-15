import { supabaseAdmin } from "../supabase/admin";
import { OrderStatus, Database } from "../types/database.types";
import { VALID_PAYMENT_METHODS } from "../constants";
import { toast } from "sonner";
type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

// Define valid payment methods to match database constraint


type PaymentMethod = typeof VALID_PAYMENT_METHODS[number];

interface CreateOrderParams {
  user_id: string; // Make user_id required
  total_amount: number;
  shipping_address: string;
  payment_method: string; // Restrict to valid payment methods
  whatsapp_number: string;
  status?: OrderStatus;
  items: {
    product_id: string;
    variant_id: string;
    quantity: number;
    price: number;
  }[];
}

// Function to create an order and its items in a single transaction
export async function createOrder(params: CreateOrderParams): Promise<Order> {
  try {
    // Validate user is authenticated
    if (!params.user_id) {
      throw new Error('User must be authenticated to create an order');
    }


    const { data, error } = await supabaseAdmin.rpc('create_order_with_items', {
      p_user_id: params.user_id,
      p_status: params.status || 'created',
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

    if (error) {
      toast.error('Error al crear la orden: ' + error.message);
      return Promise.reject(error);
    }

    if (!data) {
      toast.error('No se pudo crear la orden');
      return Promise.reject(new Error('No data returned'));
    }

    return data as Order;
  } catch (error) {
    toast.error('Error al procesar la orden');
    return Promise.reject(error);
  }
}