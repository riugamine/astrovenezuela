'use client';

import { ProductCard } from "./ProductCard";
import { useProducts } from "@/lib/hooks/useProducts";
import { memo } from 'react';
import { ProductWithDetails } from '@/lib/data/products';
import { ExchangeRate } from '@/lib/types/database.types';

interface ProductGridProps {
  products?: ProductWithDetails[];
  exchangeRate?: ExchangeRate | null;
  showPrice?: boolean;
}

/**
 * Renders a responsive grid of product cards while supporting initial data hydration,
 * exchange rate conversion and conditional price visibility.
 */
const ProductGrid = memo(function ProductGrid({ products: initialProducts, exchangeRate, showPrice = true }: ProductGridProps) {
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
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando productos...
      </div>
    );
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
        <ProductCard key={product.id} product={product} exchangeRate={exchangeRate} showPrice={showPrice} />
      ))}
    </div>
  );
});

// Export the component
export { ProductGrid };