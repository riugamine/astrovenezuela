

'use client';

import { Product, ProductDetailImage, ProductVariant } from "@/lib/types/database.types";
import { ProductCard } from "./ProductCard";
import { Badge } from "@/components/ui/badge";
import { useFilteredProducts } from "@/lib/hooks/useFilteredProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products?: (Product & {
    product_images: ProductDetailImage[];
    variants?: ProductVariant[];
  })[];
}

// Skeleton component for loading state
export function ProductGridSkeleton() {
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
}

export function ProductGrid({ products: initialProducts }: ProductGridProps) {
  const { data: filteredProducts, isLoading, error } = useFilteredProducts();
  
  // Use provided products or filtered products
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
        <div key={product.id} className="group relative flex flex-col">
          <ProductCard product={product} />
          
          {/* Tallas disponibles */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.variants
                .filter(variant => variant.stock > 0)
                .map(variant => (
                  <Badge 
                    key={variant.id} 
                    variant="outline"
                    className="text-xs"
                  >
                    {variant.size}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Create a compound component
ProductGrid.Skeleton = ProductGridSkeleton;

// Export the component with its Skeleton
export { ProductGrid as default };