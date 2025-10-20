export interface Order{
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  items: OrderItem[];
}
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'delivered';
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
}


export interface CustomerInfo {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  dni: string; // Cédula de identidad
  agencyAddress?: string; // Dirección de la agencia
}
export interface OrderItem{
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  banner_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  main_image_url: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  detail_images?: ProductDetailImage[];
  variants?: ProductVariant[];
}

export interface ProductDetailImage {
  id: string;
  product_id?: string;
  image_url: string;
  order_index: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  reference_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface ExchangeRate {
  id: string;
  bcv_rate: number;
  black_market_rate: number;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}
export interface ProductRow extends Product {
  detail_images: ProductDetailImage[];
  variants: ProductVariant[];
  category: Category;
}

// Definición del tipo Database que engloba todas las tablas
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'created_at'>;
        Update: Partial<Omit<Category, 'created_at'>>;
      };
      exchange_rates: {
        Row: ExchangeRate;
        Insert: Omit<ExchangeRate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ExchangeRate, 'id' | 'created_at' | 'updated_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'created_at'>;
        Update: Partial<Omit<Product, 'created_at'>>;
      };
      product_detail_images: {
        Row: ProductDetailImage;
        Insert: ProductDetailImage;
        Update: Partial<ProductDetailImage>;
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Omit<ProductVariant, 'created_at'>;
        Update: Partial<Omit<ProductVariant, 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'items'>;
        Update: Partial<Omit<Order, 'id' | 'items'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'>;
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
    };
  };
};