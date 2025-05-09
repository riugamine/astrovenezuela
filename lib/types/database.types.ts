export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  reference_number: string;
  category_id: string;
  main_image_url: string;
  stock: number;
  detail_images: ProductDetailImage[];
  created_at: string;
}

export interface ProductDetailImage {
  id: string;
  image_url: string;
  order_index: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
  created_at: string;
}

export interface Profile {
  id: string;
  role: 'admin' | 'customer';
  created_at: string;
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
    };
  };
};