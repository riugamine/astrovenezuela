import { useInfiniteQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ProductWithDetails } from '@/lib/data/products';
import { useFilterStore } from '@/lib/store/useFilterStore';

export const PRODUCTS_PER_PAGE = 12;

interface FetchProductsOptions {
  categories: string[];
  priceRange: [number, number];
  sortBy: string | null;
  sizes?: string[];
}

async function fetchProductsPage(page: number, options: FetchProductsOptions) {
  const { categories, priceRange, sortBy, sizes } = options;
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;
  
  const supabase = createClient();

  // Base query builder function
  const buildQuery = (query: any) => {
    let baseQuery = query
      .eq('is_active', true)
      .gte('price', priceRange[0])
      .lte('price', priceRange[1]);

    // Apply category filter
    if (categories.length > 0) {
      baseQuery = baseQuery.in('category_id', categories);
    }

    return baseQuery;
  };

  // If sizes are selected, we need to filter by products that have variants with those sizes
  let productIdsWithSelectedSizes: string[] = [];
  
  if (sizes && sizes.length > 0) {
    const { data: variantsData, error: variantsError } = await supabase
      .from('product_variants')
      .select('product_id')
      .in('size', sizes)
      .gt('stock', 0); // Only include variants with stock > 0

    if (variantsError) {
      console.error('Variants query error:', variantsError);
      throw variantsError;
    }

    productIdsWithSelectedSizes = [...new Set(variantsData?.map(v => v.product_id) || [])];
    
    // If no products have the selected sizes, return empty result
    if (productIdsWithSelectedSizes.length === 0) {
      return {
        products: [],
        hasMore: false,
        total: 0
      };
    }
  }

  // Build count query
  let countQuery = buildQuery(
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
  );

  // Apply size filter to count query if sizes are selected
  if (productIdsWithSelectedSizes.length > 0) {
    countQuery = countQuery.in('id', productIdsWithSelectedSizes);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Count query error:', countError);
    throw countError;
  }

  // Build main query with better error handling
  let mainQuery = buildQuery(
    supabase
      .from('products')
      .select(`
        *,
        product_images (*),
        variants:product_variants (*),
        category:categories (*)
      `)
  );

  // Apply size filter to main query if sizes are selected
  if (productIdsWithSelectedSizes.length > 0) {
    mainQuery = mainQuery.in('id', productIdsWithSelectedSizes);
  }

  mainQuery = mainQuery.range(from, to);

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

  const { data, error } = await mainQuery;

  if (error) {
    console.error('Products query error:', error);
    throw error;
  }

  const total = count || 0;

  return {
    products: data as ProductWithDetails[],
    hasMore: from + PRODUCTS_PER_PAGE < total,
    total
  };
}

export function useProducts(initialData?: ProductWithDetails[], queryKey: string[] = ['products'], forcedCategories?: string[]) {
  const { selectedCategories, priceRange, sortBy, selectedSizes } = useFilterStore();

  // Si forcedCategories está presente, usarlo en vez del store
  const categoriesToUse = forcedCategories && forcedCategories.length > 0 ? forcedCategories : selectedCategories;

  const finalQueryKey = [...queryKey, { filters: { categoriesToUse, priceRange, sortBy, selectedSizes } }];
  
  // Check if any filters are applied
  const hasFilters = categoriesToUse.length > 0 || 
                    selectedSizes.length > 0 || 
                    sortBy !== 'newest' || 
                    priceRange[0] !== 0 || 
                    priceRange[1] !== 1000;

  // Determine if we have initial data and no filters
  const hasInitialData = !hasFilters && initialData && initialData.length > 0;

  return useInfiniteQuery({
    queryKey: finalQueryKey,
    queryFn: ({ pageParam = 1 }) => fetchProductsPage(pageParam, {
      categories: categoriesToUse,
      priceRange,
      sortBy,
      sizes: selectedSizes
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    // Only use initialData when no filters are applied
    initialData: hasInitialData
      ? {
          pages: [{ products: initialData, hasMore: true, total: initialData.length }],
          pageParams: [1],
        }
      : undefined,
    // Prevent automatic refetch when we have initial data from server
    enabled: true, // Always enabled, but with proper staleTime
    staleTime: hasInitialData ? Infinity : 1000 * 60 * 5, // Never stale if we have initial data, 5 minutes otherwise
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2, // Reduce retries to avoid hammering server
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: !hasInitialData, // Don't refetch on mount if we have initial data
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
}