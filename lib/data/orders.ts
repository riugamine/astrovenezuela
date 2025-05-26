import { supabaseClient } from "../supabase/client";
import { Database } from "../types/database.types";
import { VALID_PAYMENT_METHODS } from "../constants";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "../store/useAuthStore";

type Order = Database['public']['Tables']['orders']['Row'];

// Validation schema for order items
const OrderItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid(),
  quantity: z.number().positive(),
  price: z.number().positive()
});


// Crear el schema de Zod para los métodos de pago usando los valores del array
const PaymentMethodSchema = z.enum(VALID_PAYMENT_METHODS);

// Validation schema for create order parameters
const CreateOrderSchema = z.object({
  user_id: z.string().uuid(),
  total_amount: z.number().positive(),
  shipping_address: z.string().min(1, "La dirección de envío es requerida"),
  payment_method: PaymentMethodSchema,
  whatsapp_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número de WhatsApp inválido"),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional(),
  items: z.array(OrderItemSchema).min(1, "Debe incluir al menos un producto")
});

type CreateOrderParams = z.infer<typeof CreateOrderSchema>;

/**
 * Creates an order and its items in a single transaction
 * @param params Order parameters including user, items, and shipping details
 * @returns Promise resolving to the created order
 * @throws Error if validation fails or database operation fails
 */
export async function createOrder(params: CreateOrderParams): Promise<Order> {
  try {
    // Validate input parameters
    const validatedParams = await CreateOrderSchema.parseAsync(params).catch((error) => {
      throw new Error(`Validation error: ${error.errors[0].message}`);
    });

    // Get current user from auth store
    const { user } = useAuthStore.getState();
    
    // Verify user authentication and authorization
    if (!user || user.id !== validatedParams.user_id) {
      const errorMessage = 'Usuario no autenticado o no autorizado';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Create order with items
    const { data, error } = await supabaseClient.rpc('create_order_with_items', {
      p_user_id: validatedParams.user_id,
      p_status: validatedParams.status || 'pending',
      p_total_amount: validatedParams.total_amount,
      p_shipping_address: validatedParams.shipping_address,
      p_payment_method: validatedParams.payment_method,
      p_whatsapp_number: validatedParams.whatsapp_number,
      p_items: validatedParams.items
    });

    // Handle database errors
    if (error) {
      const errorMessage = error.code === '23505' ? 'Ya existe una orden con estos datos' :
                          error.code === '23503' ? 'Uno o más productos no existen' :
                          'Error al crear la orden';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!data) {
      throw new Error('No se pudo crear la orden');
    }

    toast.success('Orden creada exitosamente');
    return data as Order;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar la orden';
    toast.error(errorMessage);
    throw error;
  }
}

/**
 * Fetches an order with its items and related product information
 * @param orderId The ID of the order to fetch
 * @param userId The ID of the user making the request
 * @returns Promise resolving to the order with items or null if not found
 */
export async function getOrderWithItems(orderId: string, userId: string) {
  try {
    // Validate inputs
    if (!orderId || !userId) {
      throw new Error('Order ID and User ID are required');
    }

    // First check if the order exists
    const { data: orderExists, error: checkError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (checkError) {
      throw new Error('Error checking order existence');
    }

    if (!orderExists) {
      throw new Error('Order not found');
    }

    // Now fetch the complete order with items
    const { data, error } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items!inner (*, 
          product:products!inner(*), 
          variant:product_variants!inner(*)
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();
      console.log(data);
    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Order not found or unauthorized access');
    }

    return data;
  } catch (error) {
    console.error('Error in getOrderWithItems:', error);
    const message = error instanceof Error ? error.message : 'Error fetching order';
    toast.error(message);
    return null;
  }
}