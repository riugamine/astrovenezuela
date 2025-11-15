export interface CreateProductVariant {
  size: string;
  stock: number;
  reference_number?: string;
}

export interface CreateProductImage {
  image_url: string;
  order_index: number;
}

// Type for creating a new product
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  subcategory_id?: string;
  main_image_url: string;
  is_active: boolean;
  variants: CreateProductVariant[];
  product_images: CreateProductImage[];
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  subcategory_id?: string;
  main_image_url: string;
  is_active: boolean;
  variants?: ProductVariant[];
  product_images?: ProductImage[];
  isEditing?: boolean;
  slug: string;
  stock: number;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  stock: number;
  reference_number?: string;
  image_url?: string;
  product_id: string;
}

export interface ProductImage {
  image_url: string;
  order_index: number;
  product_id: string;
}

export interface ProductWithRelations extends ProductData {
  id: string;
  created_at: string;
  variants: ProductVariant[];
  product_images: ProductImage[];
}
export interface ProductDetailImage {
  id: string;
  product_id: string;
  image_url: string;
  order_index: number;
}