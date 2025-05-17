'use client';

import { ProductFilters } from "./ProductFilters";
import { InfiniteProductsGrid } from "./InfiniteProductsGrid";
import { ProductGridSkeleton } from "./ProductGrid";
import { Suspense } from "react";
import { Category } from "@/lib/types/database.types";
import { ProductWithDetails } from "@/lib/data/products";

interface ProductsWrapperProps {
  categories: Category[];
  initialProducts: ProductWithDetails[];
  queryKey: string[];
}

export function ProductsWrapper({ categories, initialProducts, queryKey }: ProductsWrapperProps) {
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