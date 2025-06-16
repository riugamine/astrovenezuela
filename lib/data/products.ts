import { supabaseClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types/database.types";

type Tables = Database['public']['Tables'];
type ProductRow = Tables['products']['Row'];
type ProductImageRow = Tables['product_detail_images']['Row'];
type ProductVariantRow = Tables['product_variants']['Row'];

export const products: ProductWithDetails[] = [];
export type ProductWithDetails = ProductRow & {
  product_images: ProductImageRow[];
  variants: ProductVariantRow[];
};

export const PRODUCTS_PER_PAGE = 12;

/**
 * Fetches paginated products with their details
 * @param page Current page number (starts from 1)
 * @param categoryIds Optional array of category IDs to filter by
 * @returns Promise with products and hasMore flag
 */
export async function fetchProducts(page: number, categoryIds?: string[]) {
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  let query = supabaseClient
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

  // Apply category filter if provided
  if (categoryIds && categoryIds.length > 0) {
    query = query.in('category_id', categoryIds);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    products: data as ProductWithDetails[],
    hasMore: count ? from + PRODUCTS_PER_PAGE < count : false,
  };
}