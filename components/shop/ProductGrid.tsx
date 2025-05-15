

'use client';

import { ProductCard } from "./ProductCard";
import { useProducts } from "@/lib/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { memo } from 'react';
import { ProductWithDetails } from '@/lib/data/products';

interface ProductGridProps {
  products?: ProductWithDetails[];
}

// Skeleton component for loading state
const ProductGridSkeleton = memo(function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
});

const ProductGrid = memo(function ProductGrid({ products: initialProducts }: ProductGridProps) {
  const { data, isLoading, error } = useProducts(initialProducts);
  
  const products = data?.pages[0]?.products || [];

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error al cargar los productos. Por favor, intenta de nuevo.
      </div>
    );
  }

  if (isLoading && !initialProducts) {
    return <ProductGridSkeleton />;
  }

  if (!products?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron productos con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});

// Export the component
export { ProductGrid, ProductGridSkeleton };