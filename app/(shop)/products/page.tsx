import { ProductGrid } from "@/components/shop/ProductGrid";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { SortFilter } from "@/components/shop/SortFilter";

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros laterales */}
        <aside className="w-full md:w-64 space-y-6">
          <CategoryFilter />
          <SortFilter />
        </aside>

        {/* Grid de productos */}
        <main className="flex-1">
          <ProductGrid />
        </main>
      </div>
    </div>
  );
}