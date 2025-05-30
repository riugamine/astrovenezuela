import { useInfiniteQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabase/client';
import { ProductWithDetails } from '@/lib/data/products';
import { useFilterStore } from '@/lib/store/useFilterStore';

export const PRODUCTS_PER_PAGE = 12;

interface FetchProductsOptions {
  categories: string[];
  priceRange: [number, number];
  sortBy: string | null;
}

async function fetchProductsPage(page: number, options: FetchProductsOptions) {
  const { categories, priceRange, sortBy } = options;
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  
  // Base query builder function
  const buildQuery = (query: any) => {
    let baseQuery = query
      .eq('is_active', true)
      .gte('price', priceRange[0])
      .lte('price', priceRange[1]);

    // Modificar la forma en que construimos el filtro de categorías
    if (categories.length > 0) {
      baseQuery = baseQuery.in('category_id', categories);
    }

    return baseQuery;
  };

  // Build count query
  const countQuery = buildQuery(
    supabaseClient
      .from('products')
      .select('id', { count: 'exact' })
  );

  // Build main query
  let mainQuery = buildQuery(
    supabaseClient
      .from('products')
      .select(`
        *,
        product_images (*),
        variants:product_variants (*),
        category:categories (*)
      `)
  ).range(from, from + PRODUCTS_PER_PAGE - 1);

  // Apply sorting
  switch (sortBy) {
    case 'price-asc':
      mainQuery = mainQuery.order('price', { ascending: true });
      break;
    case 'price-desc':
      mainQuery = mainQuery.order('price', { ascending: false });
      break;
    case 'name-asc':
      mainQuery = mainQuery.order('name', { ascending: true });
      break;
    case 'name-desc':
      mainQuery = mainQuery.order('name', { ascending: false });
      break;
    default:
      mainQuery = mainQuery.order('created_at', { ascending: false });
  }

  const [{ count }, { data, error }] = await Promise.all([
    countQuery.single(),
    mainQuery
  ]);

  if (error) throw error;

  const total = count || 0;

  return {
    products: data as ProductWithDetails[],
    hasMore: from + PRODUCTS_PER_PAGE < total
  };
}

export function useProducts(initialData?: ProductWithDetails[], queryKey: string[] = ['products']) {
  const { selectedCategories, priceRange, sortBy } = useFilterStore();

  return useInfiniteQuery({
    queryKey: [...queryKey, { filters: { selectedCategories, priceRange, sortBy } }],
    queryFn: ({ pageParam = 1 }) => fetchProductsPage(pageParam, {
      categories: selectedCategories,
      priceRange,
      sortBy
    }),
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
    staleTime: 0,
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}