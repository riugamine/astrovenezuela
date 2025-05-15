'use client';

import { useEffect, memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductWithDetails } from '@/lib/data/products';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './ProductGrid';
import { useProducts } from '@/lib/hooks/useProducts';

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useProducts(initialProducts);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!data) {
    return <ProductGridSkeleton />;
  }

  if (status === 'error' && error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error cargando productos: {error.message}
      </div>
    );
  }

  const products = data.pages.flatMap((page) => page.products);

  if (!products.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay productos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProductList products={products} />
      
      <div ref={ref} className="w-full py-8">
        {isFetchingNextPage && <ProductGridSkeleton />}
      </div>
    </div>
  );
}

export { ProductGridSkeleton };
