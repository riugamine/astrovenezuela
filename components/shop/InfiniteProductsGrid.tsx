'use client';

import { useEffect, memo, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductWithDetails } from '@/lib/data/products';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './ProductGrid';
import { useProducts } from '@/lib/hooks/useProducts';
import { useFilterStore } from '@/lib/store/useFilterStore';

interface InfiniteProductsGridProps {
  initialProducts?: ProductWithDetails[];
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

export function InfiniteProductsGrid({ initialProducts }: InfiniteProductsGridProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '100px',
  });

  const { selectedCategories, priceRange, sortBy } = useFilterStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    isLoading,
    isFetching,
  } = useProducts(initialProducts);

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
      {isFetching && !isFetchingNextPage && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <ProductGridSkeleton />
        </div>
      )}
      
      <ProductList products={products} />
      
      <div ref={ref} className="w-full py-8">
        {isFetchingNextPage && <ProductGridSkeleton />}
      </div>
    </div>
  );
}

export { ProductGridSkeleton };
