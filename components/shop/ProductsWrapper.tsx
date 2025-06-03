'use client';

import { ProductFilters } from "./ProductFilters";
import { InfiniteProductsGrid } from "./InfiniteProductsGrid";
import { ProductGridSkeleton } from "./ProductGrid";
import { Suspense, useEffect } from "react";
import { Category } from "@/lib/types/database.types";
import { ProductWithDetails } from "@/lib/data/products";
import { useFilterStore } from "@/lib/store/useFilterStore";

interface ProductsWrapperProps {
  categories: Category[];
  initialProducts: ProductWithDetails[];
  queryKey: string[];
  initialURLParams?: URLSearchParams;
}

export function ProductsWrapper({ 
  categories, 
  initialProducts, 
  queryKey, 
  initialURLParams 
}: ProductsWrapperProps) {
  const setFiltersFromURL = useFilterStore((state) => state.setFiltersFromURL);

  // Initialize filters from URL parameters
  useEffect(() => {
    if (initialURLParams) {
      setFiltersFromURL(initialURLParams);
    } else if (typeof window !== 'undefined') {
      // Fallback: read from current URL if no initial params provided
      const urlParams = new URLSearchParams(window.location.search);
      setFiltersFromURL(urlParams);
    }
  }, [initialURLParams, setFiltersFromURL]);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductFilters categories={categories} />
      <main>
        <Suspense fallback={<ProductGridSkeleton />}>
          <InfiniteProductsGrid initialProducts={initialProducts} queryKey={queryKey} />
        </Suspense>
      </main>
    </div>
  );
}