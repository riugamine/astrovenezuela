'use client';

import { useEffect, memo, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductWithDetails } from '@/lib/data/products';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/lib/hooks/useProducts';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { Card, CardContent } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
interface InfiniteProductsGridProps {
  initialProducts?: ProductWithDetails[];
  queryKey: string[];
}

const ProductList = memo(function ProductList({ products }: { products: ProductWithDetails[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
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
            <Skeleton className="aspect-square bg-muted" />
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

export function InfiniteProductsGrid({ initialProducts, queryKey }: InfiniteProductsGridProps) {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '100px',
  });

  const { selectedCategories, priceRange, sortBy } = useFilterStore();
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [selectedCategories, priceRange, sortBy, queryClient, queryKey]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    isLoading,
    isFetching,
  } = useProducts(initialProducts, queryKey);

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

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (status === 'error' && error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error cargando productos: {error.message}
      </div>
    );
  }

  const products = data?.pages.flatMap((page) => page.products) || [];

  if (!products.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay productos disponibles con los filtros seleccionados
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {isFetching && !isFetchingNextPage && <ProductGridSkeleton />}
      
      {!isFetching && <ProductList products={products} />}
      
      <div ref={ref} className="w-full py-8">
        {isFetchingNextPage && <ProductGridSkeleton />}
      </div>
    </div>
  );
}

export { ProductGridSkeleton };
