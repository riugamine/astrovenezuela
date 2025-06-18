import { getCategories } from "@/lib/data/categories";
import { notFound } from "next/navigation";
import { ProductsWrapper } from "@/components/shop/ProductsWrapper";
import { supabaseClient } from "@/lib/supabase/client";

const PRODUCTS_PER_PAGE = 12;

async function getSubcategoryWithProducts(
  categorySlug: string,
  subcategorySlug: string
) {
  // Intentemos primero encontrar la categoría padre
  const { data: parentCategory, error: parentError } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();

  if (parentError || !parentCategory) {
    return null;
  }

  // Luego busquemos la subcategoría
  const { data: subcategory, error: subcategoryError } = await supabaseClient
    .from("categories")
    .select(
      `
      *,
      parent:categories!parent_id(*)
    `
    )
    .eq("slug", subcategorySlug)
    .eq("parent_id", parentCategory.id)
    .eq("is_active", true)
    .single();

  if (subcategoryError || !subcategory) {
    return null;
  }

  // Si llegamos aquí, busquemos los productos
  const { data: products, error: productsError } = await supabaseClient
    .from("products")
    .select(
      `
      *,
      product_images (id, product_id, image_url, order_index),
              variants:product_variants(id, size, stock, reference_number)
    `
    )
    .eq("category_id", subcategory.id)
    .eq("is_active", true)
    .range(0, PRODUCTS_PER_PAGE - 1);

  if (productsError) {
    return null;
  }

  return {
    subcategory,
    products: products || [],
  };
}
type PageParams = {
  params: Promise<{
    slug: string;
    subcategoria: string;
  }>;
};
export default async function SubcategoryPage({ params }: PageParams) {
  const resolvedParams = await Promise.resolve(params);
  const data = await getSubcategoryWithProducts(
    resolvedParams.slug,
    resolvedParams.subcategoria
  );
  if (!data) {
    notFound();
  }

  const { subcategory, products } = data;
  
  // Prepare forcedCategories array for infinite scroll
  // Only include the subcategory ID since we only want products from this specific subcategory
  const forcedCategories = [subcategory.id];

  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          {subcategory.name.toLocaleUpperCase()}
        </h1>
      </div>

      <ProductsWrapper
        categories={categories}
        initialProducts={products}
        queryKey={[`subcategory-${subcategory.id}-products`]}
        forcedCategories={forcedCategories}
      />
    </div>
  );
}
