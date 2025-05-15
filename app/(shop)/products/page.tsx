import { ProductGrid } from "@/components/shop/ProductGrid";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { SortFilter } from "@/components/shop/SortFilter";
import { supabaseClient } from "@/lib/supabase/client";
import { Category } from "@/lib/types/database.types";
import { Suspense } from "react";

// Fetch categories server-side
async function getCategories() {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("is_active", true);

  if (error) throw error;
  return data as Category[];
}

export default async function ProductsPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros laterales */}
        <aside className="w-full md:w-64 space-y-6">
          <CategoryFilter categories={categories} />
          <SortFilter />
        </aside>

        {/* Grid de productos */}
        <main className="flex-1">
          <Suspense fallback={<ProductGrid.Skeleton />}>
            <ProductGrid />
          </Suspense>
        </main>
      </div>
    </div>
  );
}