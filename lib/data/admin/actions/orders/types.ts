export interface OrderWithProfile {
  id: string;
  user_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'delivered';
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  whatsapp_number: string;
  created_at: string;
  // Guest order fields
  customer_email?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_dni?: string;
  customer_phone?: string;
  shipping_method?: string;
  order_notes?: string;
  agency_address?: string;
  // Profile fields (for authenticated users)
  profiles?: {
    full_name: string;
    email: string;
  };
}
export interface OrderItem {
  id: string;
  order_id: string;
  products_id: string;
  variant_id?: string;
  quantity: number;
  products: {
    name: string;
    price: number;
    stock: number;
  };
  product_variants?: {
    id: string;
    stock: number;
    size?: string;
  };
}

export interface OrderDetails {
  order: OrderWithProfile;
  items: OrderItem[];
}