import { supabaseClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types/database.types";

type Tables = Database['public']['Tables'];
type ProductRow = Tables['products']['Row'];
type ProductImageRow = Tables['product_detail_images']['Row'];
type ProductVariantRow = Tables['product_variants']['Row'];

export type ProductWithDetails = ProductRow & {
  product_images: ProductImageRow[];
  variants: ProductVariantRow[];
};

export const PRODUCTS_PER_PAGE = 12;

/**
 * Fetches paginated products with their details
 * @param page Current page number (starts from 1)
 * @returns Promise with products and hasMore flag
 */
export async function fetchProducts(page: number) {
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  const { data, error, count } = await supabaseClient
    .from("products")
    .select(
      `
      *,
      product_images (*),
      variants:product_variants (*)
    `,
      { count: "exact" }
    )
    .range(from, to)
    .eq("is_active", true);

  if (error) throw error;

  return {
    products: data as ProductWithDetails[],
    hasMore: count ? from + PRODUCTS_PER_PAGE < count : false,
  };
}