import { useInfiniteQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabase/client';
import { ProductWithDetails } from '@/lib/data/products';

export const PRODUCTS_PER_PAGE = 12;

async function fetchProductsPage(page: number) {
  // First, get the total count of products
  const { count } = await supabaseClient
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (!count) return { products: [], hasMore: false };

  const from = (page - 1) * PRODUCTS_PER_PAGE;
  // Ensure 'to' doesn't exceed the total count
  const to = Math.min(from + PRODUCTS_PER_PAGE - 1, count - 1);

  // Only fetch if we have a valid range
  if (from <= to) {
    const { data, error } = await supabaseClient
      .from("products")
      .select(
        `
        *,
        product_images (*),
        variants:product_variants (*)
      `
      )
      .range(from, to)
      .eq("is_active", true);

    if (error) throw error;

    return {
      products: data as ProductWithDetails[],
      hasMore: to + 1 < count,
    };
  }

  return { products: [], hasMore: false };
}

export function useProducts(initialData?: ProductWithDetails[]) {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam = 1 }) => fetchProductsPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialData: initialData
      ? {
          pages: [{ products: initialData, hasMore: true }],
          pageParams: [1],
        }
      : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}