'use client';

import { ProductFilters } from "./ProductFilters";
import { InfiniteSearchGrid } from "./InfiniteSearchGrid";
import { useEffect, useState, Suspense } from "react";
import { Category, ExchangeRate } from "@/lib/types/database.types";
import { ProductWithDetails } from "@/lib/data/products";
import { useFilterStore } from "@/lib/store/useFilterStore";

interface SearchWrapperProps {
  query: string;
  categories: Category[];
  initialProducts: ProductWithDetails[];
  queryKey: string[];
  initialURLParams?: URLSearchParams;
  forcedCategories?: string[];
  disableCategoryFilter?: boolean;
  exchangeRate?: ExchangeRate | null;
}

export function SearchWrapper({ 
  query,
  categories, 
  initialProducts, 
  queryKey, 
  initialURLParams,
  forcedCategories: propForcedCategories,
  disableCategoryFilter = false,
  exchangeRate
}: SearchWrapperProps) {
  const setFiltersFromURL = useFilterStore((state) => state.setFiltersFromURL);
  const applyFilters = useFilterStore((state) => state.applyFilters);
  const [filtersReady, setFiltersReady] = useState(false);
  const [forcedCategories, setForcedCategories] = useState<string[] | undefined>(propForcedCategories);

  // Initialize filters from URL parameters
  useEffect(() => {
    let urlParams: URLSearchParams | undefined = undefined;
    if (initialURLParams) {
      urlParams = initialURLParams instanceof URLSearchParams
        ? initialURLParams
        : new URLSearchParams(initialURLParams as any);
      setFiltersFromURL(urlParams);
      applyFilters();
      const categoriesParam = urlParams.get('categories');
      // Use prop forcedCategories if provided, otherwise use URL param
      const finalForcedCategories = propForcedCategories || (categoriesParam ? categoriesParam.split(',') : undefined);
      setForcedCategories(finalForcedCategories);
      setFiltersReady(true);
    } else if (typeof window !== 'undefined') {
      urlParams = new URLSearchParams(window.location.search);
      setFiltersFromURL(urlParams);
      applyFilters();
      const categoriesParam = urlParams.get('categories');
      // Use prop forcedCategories if provided, otherwise use URL param
      const finalForcedCategories = propForcedCategories || (categoriesParam ? categoriesParam.split(',') : undefined);
      setForcedCategories(finalForcedCategories);
      setFiltersReady(true);
    } else if (propForcedCategories) {
      // If no URL params but we have prop forcedCategories, set them directly
      setForcedCategories(propForcedCategories);
      setFiltersReady(true);
    } else {
      setFiltersReady(true);
    }
  }, [initialURLParams, setFiltersFromURL, applyFilters, propForcedCategories]);

  if (!filtersReady) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductFilters categories={categories} disableCategoryFilter={disableCategoryFilter} />
      <main>
        <Suspense fallback={null}>
          <InfiniteSearchGrid 
            query={query}
            initialProducts={initialProducts} 
            queryKey={queryKey} 
            forcedCategories={forcedCategories}
            exchangeRate={exchangeRate}
          />
        </Suspense>
      </main>
    </div>
  );
}
