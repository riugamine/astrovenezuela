import { ProductGrid } from "@/components/shop/ProductGrid";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { SortFilter } from "@/components/shop/SortFilter";
import { supabaseClient } from "@/lib/supabase/client";
import { Product, Category } from "@/lib/types/database.types";

// Fetch data server-side
async function getData() {
  const { data: categories } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("is_active", true);

  const { data: products } = await supabaseClient
    .from("products")
    .select(`
      *,
      product_images (id, product_id, image_url, order_index),
      category:category_id (id, name, slug)
    `)
    
    .order("created_at", { ascending: false });
    console.log(products);
  return {
    categories: (categories as Category[]) || [],
    products: products || [],
  };
}

export default async function ProductsPage() {
  const { categories, products } = await getData();

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
          <ProductGrid initialProducts={products} />
        </main>
      </div>
    </div>
  );
}