import { ProductGridSkeleton } from "@/components/shop/ProductGrid";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { SortFilter } from "@/components/shop/SortFilter";
import { getCategories } from "@/lib/data/categories";
import { Suspense } from "react";
import { InfiniteProductsGrid } from "@/components/shop/InfiniteProductsGrid";
import { fetchProducts } from "@/lib/data/products";

export default async function ProductsPage() {
  const [categories, initialProducts] = await Promise.all([
    getCategories(),
    fetchProducts(1)
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-6">
          <CategoryFilter categories={categories} />
          <SortFilter />
        </aside>

        <main className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <InfiniteProductsGrid initialProducts={initialProducts.products} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
