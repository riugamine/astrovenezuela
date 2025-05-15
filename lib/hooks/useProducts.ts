import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
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
  
  // Primero, obtener todas las subcategorías si hay categorías seleccionadas
  let allCategories = [...categories];
  
  if (categories.length > 0) {
    const { data: subcategories } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('is_active', true)
      .in('parent_id', categories);

    if (subcategories) {
      allCategories = [...allCategories, ...subcategories.map(cat => cat.id)];
    }
  }

  // Construir la query base para el conteo
  let countQuery = supabaseClient
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .gte("price", priceRange[0])
    .lte("price", priceRange[1]);

  // Aplicar filtro de categorías al conteo si hay categorías seleccionadas
  if (allCategories.length > 0) {
    countQuery = countQuery.in("category_id", allCategories);
  }

  // Obtener el conteo total
  const { count } = await countQuery;

  if (!count || count === 0) {
    return { products: [], hasMore: false };
  }

  // Calcular el rango para la paginación
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = Math.min(from + PRODUCTS_PER_PAGE - 1, count - 1);

  // Si el rango no es válido, retornar array vacío
  if (from >= count) {
    return { products: [], hasMore: false };
  }

  // Construir la query principal
  let mainQuery = supabaseClient
    .from("products")
    .select(
      `
      *,
      product_images (*),
      variants:product_variants (*),
      category:category_id (*)
    `
    )
    .eq("is_active", true)
    .gte("price", priceRange[0])
    .lte("price", priceRange[1])
    .range(from, to);

  // Aplicar filtro de categorías a la query principal
  if (allCategories.length > 0) {
    mainQuery = mainQuery.in("category_id", allCategories);
  }

  // Aplicar ordenamiento
  switch (sortBy) {
    case "price-asc":
      mainQuery = mainQuery.order("price", { ascending: true });
      break;
    case "price-desc":
      mainQuery = mainQuery.order("price", { ascending: false });
      break;
    case "name-asc":
      mainQuery = mainQuery.order("name", { ascending: true });
      break;
    case "name-desc":
      mainQuery = mainQuery.order("name", { ascending: false });
      break;
    default:
      mainQuery = mainQuery.order("created_at", { ascending: false });
  }

  const { data, error } = await mainQuery;

  if (error) throw error;

  return {
    products: data as ProductWithDetails[],
    hasMore: to + 1 < count,
  };
}

export function useProducts(initialData?: ProductWithDetails[]) {
  const queryClient = useQueryClient();
  const { selectedCategories, priceRange, sortBy } = useFilterStore();

  // Crear una key única para la query que incluya todos los filtros
  const queryKey = ['products', { 
    categories: selectedCategories, 
    priceRange, 
    sortBy 
  }];

  return useInfiniteQuery({
    queryKey,
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
    staleTime: 0, // Hacer que la query se considere obsoleta inmediatamente
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}