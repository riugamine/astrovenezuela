

'use client';

import { Database } from "@/lib/types/database.types";
import { ProductCard } from "./ProductCard";
import { useFilteredProducts } from "@/lib/hooks/useFilteredProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { memo } from 'react';

type Tables = Database['public']['Tables'];
type ProductRow = Tables['products']['Row'];
type ProductImageRow = Tables['product_detail_images']['Row'];
type ProductVariantRow = Tables['product_variants']['Row'];

type ProductWithDetails = ProductRow & {
  product_images: ProductImageRow[];
  variants?: ProductVariantRow[];
};

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
  const { data: filteredProducts, isLoading, error } = useFilteredProducts();
  
  const products = initialProducts || filteredProducts;

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