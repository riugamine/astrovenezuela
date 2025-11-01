import { useInfiniteQuery } from '@tanstack/react-query';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { supabaseClient } from '@/lib/supabase/client';
import { ProductWithDetails } from '@/lib/data/products';

export const SEARCH_PRODUCTS_PER_PAGE = 12;

interface SearchProductsOptions {
  query: string;
  categories: string[];
  priceRange: [number, number];
  sortBy: string | null;
  sizes?: string[];
}

async function fetchSearchProductsPage(page: number, options: SearchProductsOptions) {
  const { query, categories, priceRange, sortBy, sizes } = options;

  // Validate pagination parameters
  if (page < 1) {
    return {
      products: [],
      hasMore: false,
      total: 0
    };
  }

  try {
    // Use the PostgreSQL RPC function for normalized search
    const { data: searchResults, error: rpcError } = await supabaseClient
      .rpc('search_products_normalized', {
        search_query: query,
        page_number: page,
        page_size: SEARCH_PRODUCTS_PER_PAGE
      });

    if (rpcError) {
      console.error('Search RPC error:', rpcError);
      return {
        products: [],
        hasMore: false,
        total: 0
      };
    }

    const totalCount = searchResults && searchResults.length > 0 
      ? Number(searchResults[0].total_count) 
      : 0;

    // If no results, return early
    if (!searchResults || searchResults.length === 0) {
      return {
        products: [],
        hasMore: false,
        total: 0
      };
    }

    // Get product IDs from search results
    const productIds = searchResults.map((p: any) => p.id);

    // Fetch full product data with relations
    let productsQuery = supabaseClient
      .from("products")
      .select(`
        *,
        product_images (*),
        variants:product_variants (*),
        category:categories (*)
      `)
      .in('id', productIds);

    // Apply additional filters
    if (categories.length > 0) {
      productsQuery = productsQuery.in('category_id', categories);
    }

    // Apply price range filter
    productsQuery = productsQuery
      .gte('price', priceRange[0])
      .lte('price', priceRange[1]);

    // Apply size filter if needed
    if (sizes && sizes.length > 0) {
      const { data: variantsData, error: variantsError } = await supabaseClient
        .from('product_variants')
        .select('product_id')
        .in('size', sizes)
        .gt('stock', 0);

      if (variantsError) {
        console.error('Variants query error:', variantsError);
      } else {
        const productIdsWithSelectedSizes = [...new Set(variantsData?.map(v => v.product_id) || [])];
        
        if (productIdsWithSelectedSizes.length > 0) {
          productsQuery = productsQuery.in('id', productIdsWithSelectedSizes);
        } else {
          return {
            products: [],
            hasMore: false,
            total: 0
          };
        }
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        productsQuery = productsQuery.order('price', { ascending: true });
        break;
      case 'price-desc':
        productsQuery = productsQuery.order('price', { ascending: false });
        break;
      case 'name-asc':
        productsQuery = productsQuery.order('name', { ascending: true });
        break;
      case 'name-desc':
        productsQuery = productsQuery.order('name', { ascending: false });
        break;
      default:
        productsQuery = productsQuery.order('created_at', { ascending: false });
    }

    const { data: products, error } = await productsQuery;

    if (error) {
      console.error('Products fetch error:', error);
      return {
        products: [],
        hasMore: false,
        total: 0
      };
    }

    return {
      products: products as ProductWithDetails[],
      hasMore: totalCount > page * SEARCH_PRODUCTS_PER_PAGE,
      total: totalCount
    };
  } catch (error) {
    console.error('Search products error:', error);
    return {
      products: [],
      hasMore: false,
      total: 0
    };
  }
}

export function useSearchProducts(
  query: string, 
  initialData?: any[], 
  queryKey: string[] = ['search'], 
  forcedCategories?: string[],
  initialTotal?: number
) {
  const { selectedCategories, priceRange, sortBy, selectedSizes } = useFilterStore();

  // Si forcedCategories está presente, usarlo en vez del store
  const categoriesToUse = forcedCategories && forcedCategories.length > 0 ? forcedCategories : selectedCategories;

  const finalQueryKey = [...queryKey, query, { filters: { categoriesToUse, priceRange, sortBy, selectedSizes } }];
  
  // Check if any filters are applied
  const hasFilters = categoriesToUse.length > 0 || 
                    selectedSizes.length > 0 || 
                    sortBy !== 'newest' || 
                    priceRange[0] !== 0 || 
                    priceRange[1] !== 1000;

  return useInfiniteQuery({
    queryKey: finalQueryKey,
    queryFn: ({ pageParam = 1 }) => fetchSearchProductsPage(pageParam, {
      query,
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
    initialData: !hasFilters && initialData && initialTotal !== undefined
      ? {
          pages: [{ 
            products: initialData, 
            hasMore: initialTotal > SEARCH_PRODUCTS_PER_PAGE, 
            total: initialTotal 
          }],
          pageParams: [1],
        }
      : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
