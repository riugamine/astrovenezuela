export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  reference_number: string;
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
  product_id?: string;
}

export interface ProductImage {
  image_url: string;
  order_index: number;
  product_id?: string;
}

export interface ProductWithRelations extends ProductData {
  id: string;
  created_at: string;
  variants: ProductVariant[];
  product_images: ProductImage[];
}
export interface ProductDetailImage {
  id: string;
  product_id?: string;
  image_url: string;
  order_index: number;
}