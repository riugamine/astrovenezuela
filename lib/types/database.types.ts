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
  price: number;
  description: string;
  image_url: string;
  slug: string;
  category_id: string;
  created_at: string;
  stock: number;
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