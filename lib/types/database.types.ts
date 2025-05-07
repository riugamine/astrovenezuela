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