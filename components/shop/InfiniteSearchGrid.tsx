'use client';

import { useEffect, memo, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductWithDetails } from '@/lib/data/products';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchProducts } from '@/lib/hooks/useSearchProducts';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { Card, CardContent } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { ExchangeRate } from '@/lib/types/database.types';

interface InfiniteSearchGridProps {
  query: string;
  initialProducts?: ProductWithDetails[];
  queryKey: string[];
  forcedCategories?: string[];
  exchangeRate?: ExchangeRate | null;
  initialTotal?: number; // Add total count from server
}

const ProductList = memo(function ProductList({ products, exchangeRate }: { products: ProductWithDetails[]; exchangeRate?: ExchangeRate | null }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} exchangeRate={exchangeRate} />
      ))}
    </div>
  );
});

const ProductGridSkeleton = memo(function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-none h-full">
          <CardContent className="p-0">
            <Skeleton className="aspect-[4/5] bg-muted" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

export function InfiniteSearchGrid({ query, initialProducts, queryKey, forcedCategories, exchangeRate, initialTotal }: InfiniteSearchGridProps) {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '100px',
  });

  const { selectedCategories, priceRange, sortBy, selectedSizes } = useFilterStore();
  
  // Check if any filters are applied
  const hasFilters = selectedCategories.length > 0 || 
                    selectedSizes.length > 0 || 
                    sortBy !== 'newest' || 
                    priceRange[0] !== 0 || 
                    priceRange[1] !== 1000;
  
  useEffect(() => {
    // Invalidate all queries that start with the base queryKey
    // This will invalidate all variations of the query with different filters
    queryClient.invalidateQueries({ 
      queryKey: queryKey,
      exact: false // This allows invalidating all queries that start with this key
    });
  }, [selectedCategories, priceRange, sortBy, selectedSizes, queryClient, queryKey]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    isLoading,
  } = useSearchProducts(
    query,
    // Only pass initialProducts when no filters are applied
    hasFilters ? undefined : initialProducts,
    queryKey,
    forcedCategories,
    initialTotal // Pass the total from server
  );

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (inView) {
      handleFetchNextPage();
    }
  }, [inView, handleFetchNextPage]);

  // Flatten all products from pages and remove duplicates by ID
  const products = data?.pages.flatMap((page) => page.products) || [];
  
  // Remove duplicates using a Map to keep only unique products by ID
  const uniqueProducts = Array.from(
    new Map(products.map(product => [product.id, product])).values()
  );

  if (isLoading && !uniqueProducts.length) {
    return <ProductGridSkeleton />;
  }

  if (status === 'error' && error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error cargando productos: {error.message}
      </div>
    );
  }

  if (!uniqueProducts.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay productos disponibles con los filtros seleccionados
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <ProductList products={uniqueProducts} exchangeRate={exchangeRate} />
      <div ref={ref} className="w-full py-8">
        {isFetchingNextPage && <ProductGridSkeleton />}
      </div>
    </div>
  );
}

export { ProductGridSkeleton };
