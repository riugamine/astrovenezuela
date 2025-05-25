export interface OrderWithProfile {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'delivered';
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  whatsapp_number: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}
export interface OrderItem {
  id: string;
  order_id: string;
  products_id: string;
  quantity: number;
  products: {
    name: string;
    price: number;
  };
}

export interface OrderDetails {
  order: OrderWithProfile;
  items: OrderItem[];
}