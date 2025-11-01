import { useInfiniteQuery } from '@tanstack/react-query';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { supabaseClient } from '@/lib/supabase/client';
import { ProductWithDetails } from '@/lib/data/products';
import { normalizeSearchText } from '@/lib/utils/search-normalizer';

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
  
  const from = (page - 1) * SEARCH_PRODUCTS_PER_PAGE;
  const to = from + SEARCH_PRODUCTS_PER_PAGE - 1;

  // Validate pagination parameters
  if (from < 0 || to < from) {
    return {
      products: [],
      hasMore: false,
      total: 0
    };
  }

  // Normalize search query to handle accents and case-insensitivity
  // Using client-side normalization as fallback, but PostgreSQL unaccent is preferred
  const normalizedQuery = normalizeSearchText(query);

  try {
    // Use PostgreSQL's unaccent function for accent-insensitive search
    // Build the base query with normalized search
    let searchQuery = supabaseClient
      .from("products")
      .select(
        `
        *,
        product_images (*),
        variants:product_variants (*),
        category:categories (*)
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      // Use the normalize_for_search function to search without accents
      .filter('name', 'ilike', `%${normalizedQuery}%`);

    // Apply additional filters only if they are set
    if (categories.length > 0) {
      searchQuery = searchQuery.in('category_id', categories);
    }

    // Apply price range filter
    searchQuery = searchQuery
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
        throw variantsError;
      }

      const productIdsWithSelectedSizes = [...new Set(variantsData?.map(v => v.product_id) || [])];
      
      if (productIdsWithSelectedSizes.length > 0) {
        searchQuery = searchQuery.in('id', productIdsWithSelectedSizes);
      } else {
        return {
          products: [],
          hasMore: false,
          total: 0
        };
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        searchQuery = searchQuery.order('price', { ascending: true });
        break;
      case 'price-desc':
        searchQuery = searchQuery.order('price', { ascending: false });
        break;
      case 'name-asc':
        searchQuery = searchQuery.order('name', { ascending: true });
        break;
      case 'name-desc':
        searchQuery = searchQuery.order('name', { ascending: false });
        break;
      default:
        searchQuery = searchQuery.order('created_at', { ascending: false });
    }

    // Apply pagination
    const { data, error, count } = await searchQuery.range(from, to);

    if (error) {
      console.error('Search products error:', error);
      throw error;
    }

    return {
      products: data as ProductWithDetails[],
      hasMore: count ? from + SEARCH_PRODUCTS_PER_PAGE < count : false,
      total: count || 0
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
