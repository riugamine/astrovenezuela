import { supabaseClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types/database.types";
import { normalizeSearchText } from "@/lib/utils/search-normalizer";

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

        if (error) {
          return {
            products: [],
            hasMore: false,
            totalCount: 0
          };
        }

  return {
    products: data as ProductWithDetails[],
    hasMore: count ? from + PRODUCTS_PER_PAGE < count : false,
  };
}

/**
 * Searches for products by name and category using accent-insensitive search
 * @param query Search query string
 * @param page Current page number (starts from 1)
 * @returns Promise with products and hasMore flag
 */
export async function searchProducts(query: string, page: number = 1) {
  // Validate pagination parameters
  if (page < 1) {
    return {
      products: [],
      hasMore: false,
      totalCount: 0,
    };
  }

  try {
    // Use the PostgreSQL RPC function for normalized search
    const { data: searchResults, error } = await supabaseClient
      .rpc('search_products_normalized', {
        search_query: query,
        page_number: page,
        page_size: PRODUCTS_PER_PAGE
      });

    if (error) {
      console.error('Search RPC error:', error);
      return {
        products: [],
        hasMore: false,
        totalCount: 0,
      };
    }

    const totalCount = searchResults && searchResults.length > 0 
      ? Number(searchResults[0].total_count) 
      : 0;

    // Now fetch the related data (images, variants, category) for each product
    if (searchResults && searchResults.length > 0) {
      const productIds = searchResults.map((p: any) => p.id);
      
      const { data: productsWithRelations, error: relationsError } = await supabaseClient
        .from("products")
        .select(`
          *,
          product_images (*),
          variants:product_variants (*),
          category:categories (*)
        `)
        .in('id', productIds);

      if (relationsError) {
        console.error('Relations fetch error:', relationsError);
      }

      // Sort products to match the order from search results
      const sortedProducts = productIds
        .map(id => productsWithRelations?.find(p => p.id === id))
        .filter(Boolean);

      return {
        products: sortedProducts as (ProductWithDetails & { category: any })[],
        hasMore: totalCount > page * PRODUCTS_PER_PAGE,
        totalCount: totalCount,
      };
    }

    return {
      products: [],
      hasMore: false,
      totalCount: 0,
    };
  } catch (err) {
    // Return empty results on error
    console.error('Search exception:', err);
    return {
      products: [],
      hasMore: false,
      totalCount: 0,
    };
  }
}